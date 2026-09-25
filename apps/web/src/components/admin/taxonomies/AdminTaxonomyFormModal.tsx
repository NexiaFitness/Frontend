/**
 * AdminTaxonomyFormModal.tsx — Crear/editar taxonomía (T2).
 */

import React, { useEffect, useMemo, useState } from "react";
import {
    parseAdminTaxonomiesApiError,
    useCreateAdminTaxonomyMutation,
    useUpdateAdminTaxonomyMutation,
    type TaxonomyCreateIn,
    type TaxonomyItemOut,
    type TaxonomyKind,
    type TaxonomyUpdateIn,
} from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Input, Label, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    ADMIN_TAX_COPY,
    ADMIN_TAX_FORM_FULL,
    ADMIN_TAX_FORM_GRID,
    ADMIN_TAX_HINT,
    UI_BUCKET_OPTIONS,
} from "./adminTaxonomiesPresentation";
import type { AdminTaxonomyImpactPayload } from "./AdminTaxonomyImpactModal";

type FormState = {
    name_en: string;
    name_es: string;
    name: string;
    description: string;
    ui_bucket: string;
    parent_id: string;
    level: string;
    muscle_group_id: string;
    joint_id: string;
    region: string;
    category: string;
};

const emptyForm = (): FormState => ({
    name_en: "",
    name_es: "",
    name: "",
    description: "",
    ui_bucket: "ACCESSORY",
    parent_id: "",
    level: "2",
    muscle_group_id: "",
    joint_id: "",
    region: "",
    category: "",
});

function fromItem(item: TaxonomyItemOut): FormState {
    return {
        name_en: item.name_en ?? "",
        name_es: item.name_es ?? "",
        name: item.name ?? "",
        description: item.description ?? "",
        ui_bucket: item.ui_bucket ?? "ACCESSORY",
        parent_id: item.parent_id != null ? String(item.parent_id) : "",
        level: item.level != null ? String(item.level) : "2",
        muscle_group_id:
            item.muscle_group_id != null ? String(item.muscle_group_id) : "",
        joint_id: item.joint_id != null ? String(item.joint_id) : "",
        region: item.region ?? "",
        category: item.category ?? "",
    };
}

export interface AdminTaxonomyFormModalProps {
    isOpen: boolean;
    kind: TaxonomyKind;
    item: TaxonomyItemOut | null;
    onClose: () => void;
    onSaved: () => void;
    onImpactRequired?: (payload: AdminTaxonomyImpactPayload) => void;
}

export const AdminTaxonomyFormModal: React.FC<AdminTaxonomyFormModalProps> = ({
    isOpen,
    kind,
    item,
    onClose,
    onSaved,
    onImpactRequired,
}) => {
    const isEdit = item != null;
    const [form, setForm] = useState<FormState>(emptyForm);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);

    const [createItem, createState] = useCreateAdminTaxonomyMutation();
    const [updateItem, updateState] = useUpdateAdminTaxonomyMutation();
    const busy = createState.isLoading || updateState.isLoading;

    useEffect(() => {
        if (!isOpen) return;
        setFieldError(null);
        setBanner(null);
        setForm(item ? fromItem(item) : emptyForm());
    }, [isOpen, item]);

    const set =
        (key: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm((prev) => ({ ...prev, [key]: e.target.value }));
        };

    const buildCreate = (): TaxonomyCreateIn => {
        const body: TaxonomyCreateIn = {
            name_en: form.name_en.trim(),
            name_es: form.name_es.trim() || null,
            description: form.description.trim() || null,
        };
        if (kind === "patterns") body.ui_bucket = form.ui_bucket;
        if (kind === "muscle-groups") {
            body.parent_id = form.parent_id ? Number(form.parent_id) : null;
            body.level = form.level ? Number(form.level) : 2;
        }
        if (kind === "muscles") {
            body.name = form.name.trim() || form.name_en.trim();
            body.muscle_group_id = form.muscle_group_id
                ? Number(form.muscle_group_id)
                : null;
            body.joint_id = form.joint_id ? Number(form.joint_id) : null;
        }
        if (kind === "joints") {
            body.name = form.name.trim() || form.name_en.trim();
            body.region = form.region.trim();
        }
        if (kind === "joint-movements") {
            body.name = form.name.trim() || form.name_en.trim();
        }
        if (kind === "tags") body.category = form.category.trim() || null;
        return body;
    };

    const buildUpdate = (): TaxonomyUpdateIn => {
        const body: TaxonomyUpdateIn = {
            name_es: form.name_es.trim() || null,
            description: form.description.trim() || null,
        };
        if (kind === "patterns") body.ui_bucket = form.ui_bucket;
        if (kind === "muscle-groups") {
            body.parent_id = form.parent_id ? Number(form.parent_id) : null;
            body.level = form.level ? Number(form.level) : 2;
        }
        if (kind === "muscles") {
            body.name = form.name.trim() || null;
            body.muscle_group_id = form.muscle_group_id
                ? Number(form.muscle_group_id)
                : null;
            body.joint_id = form.joint_id ? Number(form.joint_id) : null;
        }
        if (kind === "joints") {
            body.name = form.name.trim() || null;
            body.region = form.region.trim() || null;
        }
        if (kind === "joint-movements") body.name = form.name.trim() || null;
        if (kind === "tags") body.category = form.category.trim() || null;
        return body;
    };

    const needsImpactConfirm = useMemo(() => {
        if (!isEdit || !item) return false;
        if (kind === "patterns" && form.ui_bucket !== (item.ui_bucket ?? "")) return true;
        if (
            kind === "muscles" &&
            String(item.muscle_group_id ?? "") !== form.muscle_group_id
        ) {
            return true;
        }
        return false;
    }, [isEdit, item, kind, form.ui_bucket, form.muscle_group_id]);

    const applySave = async (body: TaxonomyUpdateIn | TaxonomyCreateIn) => {
        setFieldError(null);
        setBanner(null);
        try {
            if (isEdit && item) {
                await updateItem({
                    kind,
                    id: item.id,
                    body: body as TaxonomyUpdateIn,
                }).unwrap();
            } else {
                await createItem({
                    kind,
                    body: body as TaxonomyCreateIn,
                }).unwrap();
            }
            onSaved();
            onClose();
        } catch (err) {
            const parsed = parseAdminTaxonomiesApiError(err);
            if (parsed.name_en) setFieldError(parsed.name_en);
            else setBanner(parsed.form ?? "No se pudo guardar.");
        }
    };

    const handleSubmit = async () => {
        if (!isEdit) {
            await applySave(buildCreate());
            return;
        }
        const body = buildUpdate();
        if (needsImpactConfirm && item && onImpactRequired) {
            onImpactRequired({
                kind,
                id: item.id,
                body,
                affectedCount: item.usage_count,
            });
            return;
        }
        await applySave(body);
    };

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? ADMIN_TAX_COPY.editTitle : ADMIN_TAX_COPY.createTitle}
            isLoading={busy}
            maxWidth="lg"
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                        {ADMIN_TAX_COPY.cancel}
                    </Button>
                    <Button type="button" onClick={() => void handleSubmit()} disabled={busy}>
                        {ADMIN_TAX_COPY.save}
                    </Button>
                </div>
            }
        >
            {banner ? <Alert variant="error">{banner}</Alert> : null}
            <div className={ADMIN_TAX_FORM_GRID}>
                <div className="space-y-1.5">
                    <Label htmlFor="tax-name-en">name_en</Label>
                    <Input
                        id="tax-name-en"
                        value={form.name_en}
                        onChange={set("name_en")}
                        disabled={isEdit || busy}
                        aria-invalid={Boolean(fieldError)}
                    />
                    {isEdit ? (
                        <p className={ADMIN_TAX_HINT}>{ADMIN_TAX_COPY.nameEnHint}</p>
                    ) : null}
                    {fieldError ? (
                        <p className="text-xs text-destructive">{fieldError}</p>
                    ) : null}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="tax-name-es">name_es</Label>
                    <Input
                        id="tax-name-es"
                        value={form.name_es}
                        onChange={set("name_es")}
                        disabled={busy}
                    />
                </div>
                {(kind === "muscles" ||
                    kind === "joints" ||
                    kind === "joint-movements") && (
                    <div className="space-y-1.5">
                        <Label htmlFor="tax-name">name</Label>
                        <Input
                            id="tax-name"
                            value={form.name}
                            onChange={set("name")}
                            disabled={busy}
                        />
                    </div>
                )}
                {kind === "patterns" ? (
                    <div className="space-y-1.5">
                        <Label htmlFor="tax-bucket">ui_bucket</Label>
                        <select
                            id="tax-bucket"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={form.ui_bucket}
                            onChange={set("ui_bucket")}
                            disabled={busy}
                        >
                            {UI_BUCKET_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
                {kind === "muscle-groups" ? (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor="tax-parent">parent_id</Label>
                            <Input
                                id="tax-parent"
                                value={form.parent_id}
                                onChange={set("parent_id")}
                                disabled={busy}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tax-level">level</Label>
                            <Input
                                id="tax-level"
                                value={form.level}
                                onChange={set("level")}
                                disabled={busy}
                            />
                        </div>
                    </>
                ) : null}
                {kind === "muscles" ? (
                    <div className="space-y-1.5">
                        <Label htmlFor="tax-group">muscle_group_id</Label>
                        <Input
                            id="tax-group"
                            value={form.muscle_group_id}
                            onChange={set("muscle_group_id")}
                            disabled={busy}
                        />
                    </div>
                ) : null}
                {kind === "joints" ? (
                    <div className="space-y-1.5">
                        <Label htmlFor="tax-region">region</Label>
                        <Input
                            id="tax-region"
                            value={form.region}
                            onChange={set("region")}
                            disabled={busy}
                        />
                    </div>
                ) : null}
                {kind === "tags" ? (
                    <div className="space-y-1.5">
                        <Label htmlFor="tax-cat">category</Label>
                        <Input
                            id="tax-cat"
                            value={form.category}
                            onChange={set("category")}
                            disabled={busy}
                        />
                    </div>
                ) : null}
                <div className={ADMIN_TAX_FORM_FULL}>
                    <Label htmlFor="tax-desc">Descripción</Label>
                    <Textarea
                        id="tax-desc"
                        value={form.description}
                        onChange={set("description")}
                        disabled={busy}
                        rows={3}
                    />
                </div>
            </div>
        </NexiaPremiumModal>
    );
};
