export interface Level { id: string; label: string; age: string }
export interface PageImage { id: string; level: string; thumb: string; print: string }
export interface Motif { id: string; label: string; thumb: string; images: PageImage[] }
export interface Subcategory { id: string; label: string; icon: string; motifs: Motif[] }
export interface Category { id: string; label: string; icon: string; subcategories: Subcategory[] }
export interface Catalog { version: number; recentIcon?: string; levels: Level[]; categories: Category[] }

/** Ein Bild mit seinem Platz im Katalog (für Verlauf, Suche, Detailansicht). */
export interface ImageRef { image: PageImage; motif: Motif; sub: Subcategory; cat: Category }
