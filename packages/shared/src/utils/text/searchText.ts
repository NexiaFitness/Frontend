/**
 * searchText.ts — Buscar en listas cortas sin distinguir mayúsculas ni acentos.
 *
 * Contexto: el selector con búsqueda de la ficha admin (músculos, patrones, material,
 * etiquetas, articulaciones y alternativas) y cualquier otro selector que filtre en
 * memoria. «bra» encuentra «Braquial» y «bíceps braquial»; «biceps» encuentra «bíceps».
 * Notas de mantenimiento: puro, sin DOM. Las opciones no elegibles se devuelven con su
 * motivo para que la pantalla las enseñe desactivadas, no se esconden.
 *
 * @author Frontend Team
 * @since v6.1.0
 */

export interface SearchOption<T extends string | number = number> {
    value: T;
    label: string;
    /** Texto secundario que también se busca (grupo, material…). */
    hint?: string;
}

export interface SearchResult<T extends string | number = number> extends SearchOption<T> {
    /** Motivo por el que no se puede elegir, o null. */
    disabledReason: string | null;
}

/** Minúsculas y sin acentos ni diacríticos, para comparar. */
export function foldSearchText(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLocaleLowerCase("es")
        .trim();
}

/** Primera letra en mayúscula («bíceps braquial» -> «Bíceps braquial»). */
export function sentenceCaseLabel(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;
    return trimmed.charAt(0).toLocaleUpperCase("es") + trimmed.slice(1);
}

/**
 * Opciones que contienen la búsqueda, en el orden recibido. Las que están en
 * `unavailable` se devuelven con su motivo (por ejemplo, «Ya es objetivo»).
 */
export function filterSearchOptions<T extends string | number>(
    options: readonly SearchOption<T>[],
    query: string,
    unavailable: ReadonlyMap<T, string> = new Map()
): SearchResult<T>[] {
    const needle = foldSearchText(query);
    return options
        .filter((option) => {
            if (!needle) return true;
            return foldSearchText(`${option.label} ${option.hint ?? ""}`).includes(needle);
        })
        .map((option) => ({ ...option, disabledReason: unavailable.get(option.value) ?? null }));
}
