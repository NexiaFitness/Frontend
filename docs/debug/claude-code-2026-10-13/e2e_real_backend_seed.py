"""e2e_real_backend_seed.py — Datos minimos para los E2E de atleta contra un backend de pruebas PROPIO.

Proposito: preparar una BD PostgreSQL aislada (nunca la de la carpeta principal ni la de :8000) con lo que
esperan los fixtures de Playwright: entrenador demo, atleta con ClientProfile id 346 (QA_PLANNING_CLIENT_ID),
vinculo entrenador-atleta, onboarding completado, 2 ejercicios y 1 tipo de bloque.
Contexto: auditoria debug/claude-code-2026-10-13, tarea 6. Las migraciones no arrancan desde una BD vacia,
asi que el esquema se crea con Base.metadata.create_all (como tests/conftest.py) + `alembic stamp head`.
Notas: ejecutar desde backend/ con su venv y DATABASE_URL apuntando a la BD aislada; contrasenas por env
(E2E_SEED_PASSWORD). Idempotente: no duplica usuarios si ya existen.

@author Claude Code (agente de depuracion)
@since 2026-10-13
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timezone

from sqlalchemy import text

from app import crud, schemas
from app.auth import schemas as auth_schemas
from app.db import models
from app.db.session import SessionLocal
from app.knowledge.training_block_types_catalog import QUALITY_TRAINING_BLOCK_ROWS

TRAINER_EMAIL = "nexiafitness.demo@gmail.com"
ATHLETE_EMAIL = "cliente.standalone.demo@example.com"
QA_CLIENT_ID = 346


def _user_by_email(db, email: str):
    from app.auth.models import User

    return db.query(User).filter(User.email == email).first()


def _ensure_user(db, email: str, role: str, password: str):
    user = _user_by_email(db, email)
    if user is None:
        user = crud.create_user(
            db,
            auth_schemas.UserCreate(
                email=email, password=password, nombre="E2E", apellidos=role, role=role
            ),
        )
    crud.verify_user_email(db, user)
    return user


def main() -> int:
    url = os.environ.get("DATABASE_URL", "")
    if "5544" not in url or "nexia_e2e_claude" not in url:
        print("Rechazado: DATABASE_URL no es la BD aislada de pruebas.", file=sys.stderr)
        return 2
    password = os.environ.get("E2E_SEED_PASSWORD", "").strip()
    if not password:
        print("Falta E2E_SEED_PASSWORD.", file=sys.stderr)
        return 2

    db = SessionLocal()
    try:
        if not db.query(models.ClientProfile).filter(models.ClientProfile.id == QA_CLIENT_ID).first():
            db.execute(text("SELECT setval('client_profiles_id_seq', :v, true)"), {"v": QA_CLIENT_ID - 1})
            db.commit()

        trainer_user = _ensure_user(db, TRAINER_EMAIL, "trainer", password)
        athlete_user = _ensure_user(db, ATHLETE_EMAIL, "athlete", password)

        trainer = db.query(models.Trainer).filter(models.Trainer.user_id == trainer_user.id).first()
        client = (
            db.query(models.ClientProfile)
            .filter(models.ClientProfile.user_id == athlete_user.id)
            .first()
        )
        if trainer is None or client is None:
            print("create_user no creo perfiles trainer/cliente.", file=sys.stderr)
            return 1
        if client.id != QA_CLIENT_ID:
            print(f"ClientProfile del atleta es {client.id}, se esperaba {QA_CLIENT_ID}.", file=sys.stderr)
            return 1
        client.onboarding_completed_at = datetime.now(timezone.utc)
        db.commit()

        link = (
            db.query(models.TrainerClient)
            .filter(
                models.TrainerClient.trainer_id == trainer.id,
                models.TrainerClient.client_id == client.id,
            )
            .first()
        )
        if link is None:
            crud.create_trainer_client(
                db, schemas.TrainerClientCreate(trainer_id=trainer.id, client_id=client.id)
            )

        # El listado solo devuelve tipos predefinidos del catalogo cerrado (G27), como tests/conftest.py.
        for name, slug in QUALITY_TRAINING_BLOCK_ROWS:
            if not db.query(models.TrainingBlockType).filter(models.TrainingBlockType.name == name).first():
                db.add(models.TrainingBlockType(name=name, is_predefined=True, physical_quality_slug=slug))
        tag = db.query(models.Tag).filter(models.Tag.name_en == "e2e").first()
        if tag is None:
            tag = models.Tag(name_en="e2e", name_es="e2e")
            db.add(tag)
            db.flush()
        for idx, name in enumerate(("Sentadilla E2E", "Remo E2E")):
            code = f"ex_e2e_{idx}"
            exercise = db.query(models.Exercise).filter(models.Exercise.exercise_id == code).first()
            if exercise is None:
                exercise = models.Exercise(
                    exercise_id=code,
                    nombre=name,
                    tipo="multiarticular",
                    nivel="intermediate",
                    equipo="barbell",
                    patron_movimiento="squat",
                    tipo_carga="external",
                    musculatura_principal="Cuadriceps",
                    is_active=True,
                )
                db.add(exercise)
                db.flush()
            # El listado de ejercicios solo incluye los que tienen algun mapping (Tablas.xlsx).
            has_tag = (
                db.query(models.ExerciseTag)
                .filter(models.ExerciseTag.exercise_id == exercise.id, models.ExerciseTag.tag_id == tag.id)
                .first()
            )
            if has_tag is None:
                db.add(models.ExerciseTag(exercise_id=exercise.id, tag_id=tag.id))
        db.commit()
        print(f"OK trainer={trainer.id} client={client.id}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
