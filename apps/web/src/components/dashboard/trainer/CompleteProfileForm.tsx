/**
 * CompleteProfileForm — Formulario de perfil profesional para trainers.
 *
 * Solo UI: toda la lógica de negocio vive en useTrainerProfile.
 * Catálogos dinámicos: países, ciudades, ocupaciones, modalidades, especialidades.
 *
 * @author Frontend Team
 * @since v2.2.0
 * @updated v8.0.0 - Rediseño con FormSection, tokens dark Nexia Sparkle Flow
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Briefcase, MapPin, Phone } from "lucide-react";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { Input } from "@/components/ui/forms/Input";
import { FormSection } from "@/components/ui/forms/FormSection";
import { Button } from "@/components/ui/buttons/Button";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useTrainerProfile, useGetCurrentTrainerProfileQuery } from "@nexia/shared";
import {
    useGetCountriesQuery,
    useGetCitiesQuery,
    useGetTrainerOccupationsQuery,
    useGetTrainingModalitiesQuery,
    useGetTrainerSpecialtiesQuery,
} from "@nexia/shared/api/catalogsApi";
import type { RootState } from "@nexia/shared/store";

function humanizeCatalogValue(str: string): string {
    return str
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(" ");
}

export const CompleteProfileForm: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: trainerData, isLoading: isLoadingTrainer } =
        useGetCurrentTrainerProfileQuery(undefined, { skip: !user });

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

    // --- Catalogs ---
    const { data: countries = [] } = useGetCountriesQuery(undefined, { skip: !user });

    const countryCode = useMemo(() => {
        const v = formData.location_country ?? "";
        const c = countries.find((x) => x.code === v || x.name === v);
        return c ? c.code : v || "";
    }, [formData.location_country, countries]);

    const { data: citiesData } = useGetCitiesQuery(countryCode, {
        skip: !countryCode || countryCode.length !== 2,
    });

    const { data: occupations = [] } = useGetTrainerOccupationsQuery(undefined, { skip: !user });
    const { data: modalities = [] } = useGetTrainingModalitiesQuery(undefined, { skip: !user });
    const { data: specialties = [] } = useGetTrainerSpecialtiesQuery(undefined, { skip: !user });

    // --- Derived options ---
    const countrySelectValue = useMemo(() => {
        const v = formData.location_country ?? "";
        const c = countries.find((x) => x.code === v || x.name === v);
        return c ? c.code : v || "";
    }, [formData.location_country, countries]);

    const occupationOptions = useMemo(
        () => [
            { value: "", label: "Selecciona tu ocupación" },
            ...occupations.map((val) => ({ value: val, label: humanizeCatalogValue(val) })),
        ],
        [occupations],
    );

    const modalityOptions = useMemo(
        () => [
            { value: "", label: "Selecciona modalidad" },
            ...modalities.map((val) => ({ value: val, label: humanizeCatalogValue(val) })),
        ],
        [modalities],
    );

    const specialtyOptions = useMemo(
        () => [
            { value: "", label: "Sin especialidad específica" },
            ...specialties.map((val) => ({ value: val, label: humanizeCatalogValue(val) })),
        ],
        [specialties],
    );

    const countryOptions = useMemo(() => {
        const opts = [
            { value: "", label: "Selecciona país" },
            ...countries.map((c) => ({ value: c.code, label: c.name })),
        ];
        const current = formData.location_country?.trim();
        const inCatalog = countries.some((c) => c.code === current || c.name === current);
        if (current && !inCatalog) opts.push({ value: current, label: current });
        return opts;
    }, [countries, formData.location_country]);

    const cityOptions = useMemo(() => {
        const cities = citiesData?.cities ?? [];
        const currentCity = formData.location_city?.trim();
        const needsLegacy = currentCity && !cities.some((c) => c === currentCity);
        return [
            { value: "", label: "Selecciona ciudad" },
            ...(needsLegacy ? [{ value: currentCity, label: currentCity }] : []),
            ...cities.map((city) => ({ value: city, label: city })),
        ];
    }, [citiesData, formData.location_city]);

    // --- Handlers ---
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await handleSubmit();
        if (result.success) {
            navigate("/dashboard", { replace: true });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (isLoadingTrainer) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {serverError && <ServerErrorBanner error={serverError} />}

            {/* Section 1: Información Profesional */}
            <FormSection icon={<Briefcase className="h-4 w-4" />} title="Información profesional">
                <p className="mb-5 -mt-2 text-sm text-muted-foreground">
                    Cuéntanos sobre tu experiencia y modalidad de trabajo
                </p>
                <div className="space-y-4">
                    <FormSelect
                        id="occupation"
                        label="Ocupación"
                        value={formData.occupation}
                        onChange={handleInputChange("occupation")}
                        options={occupationOptions}
                        error={errors.occupation}
                        required
                        disabled={isSubmitting}
                        size="sm"
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
                        size="sm"
                    />
                    <FormSelect
                        id="specialty"
                        label="Especialidad"
                        value={formData.specialty || ""}
                        onChange={handleInputChange("specialty")}
                        options={specialtyOptions}
                        error={errors.specialty}
                        disabled={isSubmitting}
                        helperText="Opcional — Ayuda a tus clientes a encontrarte"
                        size="sm"
                    />
                </div>
            </FormSection>

            {/* Section 2: Ubicación */}
            <FormSection icon={<MapPin className="h-4 w-4" />} title="Ubicación">
                <p className="mb-5 -mt-2 text-sm text-muted-foreground">
                    ¿Dónde ofreces tus servicios?
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormSelect
                        id="location_country"
                        label="País"
                        value={countrySelectValue}
                        onChange={(e) => {
                            const code = e.target.value;
                            handleInputChange("location_country")(e);
                            if (code !== countrySelectValue) {
                                handleInputChange("location_city")({ target: { value: "" } });
                            }
                        }}
                        options={countryOptions}
                        error={errors.location_country}
                        required
                        disabled={isSubmitting}
                        size="sm"
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
                        size="sm"
                    />
                </div>
            </FormSection>

            {/* Section 3: Contacto */}
            <FormSection icon={<Phone className="h-4 w-4" />} title="Contacto">
                <p className="mb-5 -mt-2 text-sm text-muted-foreground">
                    Para que tus clientes puedan comunicarse contigo
                </p>
                <Input
                    id="telefono"
                    label="Teléfono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange("telefono")}
                    error={errors.telefono}
                    placeholder="+34 600 123 456"
                    isRequired
                    disabled={isSubmitting}
                    helperText="Formato internacional recomendado"
                    size="sm"
                />
            </FormSection>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3 pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto sm:min-w-[280px]"
                >
                    {isSubmitting ? "Guardando…" : "Completar perfil y acceder"}
                </Button>
                <p className="text-xs text-muted-foreground">
                    Podrás modificar estos datos más tarde en tu cuenta
                </p>
            </div>
        </form>
    );
};
