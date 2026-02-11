/**
 * CompleteProfileForm - UI del formulario de perfil profesional
 * Renderizado y validación de UI únicamente: toda la lógica de negocio
 * está centralizada en el hook useTrainerProfile.
 *
 * Arquitectura limpia:
 * - Este componente solo presenta la UI y delega la lógica.
 * - El flujo de datos está controlado desde el hook compartido.
 *
 * TICK-I02: Dropdowns dinámicos desde GET /catalogs/* (países, ciudades,
 * ocupaciones, modalidades, especialidades).
 *
 * @author Frontend Team
 * @since v2.2.0
 * @updated v2.3.0 - Limpieza de logs y manejo profesional de feedback
 * @updated v6.2.0 - Catálogos dinámicos (TICK-I02)
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/forms/Input";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { Button } from "@/components/ui/buttons/Button";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import { useTrainerProfile, useGetCurrentTrainerProfileQuery } from "@nexia/shared";
import {
    useGetCountriesQuery,
    useGetCitiesQuery,
    useGetTrainerOccupationsQuery,
    useGetTrainingModalitiesQuery,
    useGetTrainerSpecialtiesQuery,
} from "@nexia/shared/api/catalogsApi";
import type { RootState } from "@nexia/shared/store";

/** Humaniza valores del catálogo (e.g. "personal_trainer" → "Personal trainer") */
function humanizeCatalogValue(str: string): string {
    return str
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(" ");
}

export const CompleteProfileForm: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    // Obtener perfil del trainer actual
    const { data: trainerData, isLoading: isLoadingTrainer } =
        useGetCurrentTrainerProfileQuery(undefined, { skip: !user });

    // Hook con TODA la lógica de negocio
    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        handleSubmit,
        isSubmitting,
    } = useTrainerProfile({
        trainer: trainerData || null,
        isLoading: isLoadingTrainer,
    });

    // Catálogos dinámicos (GET /catalogs/*)
    const { data: countries = [] } = useGetCountriesQuery(undefined, {
        skip: !user,
    });
    const countryCode = useMemo(() => {
        const v = formData.location_country ?? "";
        const c = countries.find((x) => x.code === v || x.name === v);
        return c ? c.code : v || "";
    }, [formData.location_country, countries]);
    const { data: citiesData } = useGetCitiesQuery(countryCode, {
        skip: !countryCode || countryCode.length !== 2,
    });
    const { data: occupations = [] } = useGetTrainerOccupationsQuery(undefined, {
        skip: !user,
    });
    const { data: modalities = [] } = useGetTrainingModalitiesQuery(undefined, {
        skip: !user,
    });
    const { data: specialties = [] } = useGetTrainerSpecialtiesQuery(undefined, {
        skip: !user,
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await handleSubmit();

        if (result.success) {
            navigate("/dashboard", { replace: true });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Resolver código de país para select (compat con datos legacy "España" vs "ES")
    const countrySelectValue = useMemo(() => {
        const v = formData.location_country ?? "";
        const c = countries.find((x) => x.code === v || x.name === v);
        return c ? c.code : v || "";
    }, [formData.location_country, countries]);

    const occupationOptions = useMemo(
        () => [
            { value: "", label: "Selecciona tu ocupación" },
            ...occupations.map((val) => ({
                value: val,
                label: humanizeCatalogValue(val),
            })),
        ],
        [occupations]
    );

    const modalityOptions = useMemo(
        () => [
            { value: "", label: "Selecciona modalidad" },
            ...modalities.map((val) => ({
                value: val,
                label: humanizeCatalogValue(val),
            })),
        ],
        [modalities]
    );

    const specialtyOptions = useMemo(
        () => [
            { value: "", label: "Sin especialidad específica" },
            ...specialties.map((val) => ({
                value: val,
                label: humanizeCatalogValue(val),
            })),
        ],
        [specialties]
    );

    const countryOptions = useMemo(() => {
        const opts = [
            { value: "", label: "Selecciona país" },
            ...countries.map((c) => ({ value: c.code, label: c.name })),
        ];
        const current = formData.location_country?.trim();
        const inCatalog = countries.some(
            (c) => c.code === current || c.name === current
        );
        if (current && !inCatalog) {
            opts.push({ value: current, label: current });
        }
        return opts;
    }, [countries, formData.location_country]);

    const cityOptions = useMemo(() => {
        const cities = citiesData?.cities ?? [];
        const currentCity = formData.location_city?.trim();
        const needsLegacyOption =
            currentCity && !cities.some((c) => c === currentCity);
        return [
            { value: "", label: "Selecciona ciudad" },
            ...(needsLegacyOption
                ? [{ value: currentCity, label: currentCity }]
                : []),
            ...cities.map((city) => ({ value: city, label: city })),
        ];
    }, [citiesData, formData.location_city]);

    if (isLoadingTrainer) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-sm">Cargando tus datos...</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            {/* Server Error Banner */}
            {serverError && <ServerErrorBanner error={serverError} />}

            {/* Sección 1: Información Profesional */}
            <div>
                <div className="mb-6">
                    <h3
                        className={`${TYPOGRAPHY.formSectionTitle} text-slate-800 mb-2`}
                    >
                        Información profesional
                    </h3>
                    <p className={`${TYPOGRAPHY.formSectionSubtitle} text-slate-600`}>
                        Cuéntanos sobre tu experiencia y modalidad de trabajo
                    </p>
                </div>

                <div className="space-y-5">
                    <FormSelect
                        id="occupation"
                        label="Ocupación"
                        value={formData.occupation}
                        onChange={handleInputChange("occupation")}
                        options={occupationOptions}
                        error={errors.occupation}
                        required
                        disabled={isSubmitting}
                    />

                    <FormSelect
                        id="training_modality"
                        label="Modalidad de entrenamiento"
                        value={formData.training_modality}
                        onChange={handleInputChange("training_modality")}
                        options={modalityOptions}
                        error={errors.training_modality}
                        required
                        disabled={isSubmitting}
                        helperText="¿Trabajas presencial, online o ambas?"
                    />

                    <FormSelect
                        id="specialty"
                        label="Especialidad"
                        value={formData.specialty || ""}
                        onChange={handleInputChange("specialty")}
                        options={specialtyOptions}
                        error={errors.specialty}
                        disabled={isSubmitting}
                        helperText="Opcional - Ayuda a tus clientes a encontrarte"
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Sección 2: Ubicación */}
            <div>
                <div className="mb-6">
                    <h3
                        className={`${TYPOGRAPHY.formSectionTitle} text-slate-800 mb-2`}
                    >
                        Ubicación
                    </h3>
                    <p className={`${TYPOGRAPHY.formSectionSubtitle} text-slate-600`}>
                        ¿Dónde ofreces tus servicios?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormSelect
                        id="location_country"
                        label="País"
                        value={countrySelectValue}
                        onChange={(e) => {
                            const code = e.target.value;
                            handleInputChange("location_country")(e);
                            if (code !== countrySelectValue) {
                                handleInputChange("location_city")({
                                    target: { value: "" },
                                });
                            }
                        }}
                        options={countryOptions}
                        error={errors.location_country}
                        required
                        disabled={isSubmitting}
                    />

                    <FormSelect
                        id="location_city"
                        label="Ciudad"
                        value={formData.location_city || ""}
                        onChange={handleInputChange("location_city")}
                        options={cityOptions}
                        error={errors.location_city}
                        required
                        disabled={isSubmitting || !countryCode}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Sección 3: Contacto */}
            <div>
                <div className="mb-6">
                    <h3
                        className={`${TYPOGRAPHY.formSectionTitle} text-slate-800 mb-2`}
                    >
                        Contacto
                    </h3>
                    <p className={`${TYPOGRAPHY.formSectionSubtitle} text-slate-600`}>
                        Para que tus clientes puedan comunicarse contigo
                    </p>
                </div>

                <Input
                    id="telefono"
                    label="Teléfono"
                    type="text"
                    value={formData.telefono}
                    onChange={handleInputChange("telefono")}
                    error={errors.telefono}
                    placeholder="+34 600 123 456"
                    isRequired
                    disabled={isSubmitting}
                    helperText="Formato internacional recomendado"
                />
            </div>

            {/* Submit Button */}
            <div className="pt-6 space-y-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting
                        ? "Guardando..."
                        : "Completar perfil y acceder al dashboard"}
                </Button>

                <p className="text-sm text-slate-500 text-center">
                    Podrás modificar estos datos más tarde en tu cuenta
                </p>
            </div>
        </form>
    );
};
