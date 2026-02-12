export interface Property {
    id: string;
    titulo: string;
    descripcion: string;
    ciudad: "Cúcuta" | "Los Patios" | "Villa del Rosario";
    barrio: string;
    precio: number;
    tipo: "casa" | "apartamento" | "lote";
    habitaciones: number;
    baños: number;
    area_m2: number;
    imagen_principal: string;
    galeria: string[];
    slug: string;
    updatedAt?: string;
    createdAt?: string;
}

export const properties: Property[] = [
    // Cúcuta
    {
        id: "cuc-1",
        titulo: "Apartamento de Lujo en La Riviera",
        descripcion: "Espectacular apartamento ubicado en el exclusivo sector de La Riviera. Cuenta con acabados de primera, amplia sala-comedor, balcón con vista a la ciudad y zona social completa con piscina y gimnasio.",
        ciudad: "Cúcuta",
        barrio: "La Riviera",
        precio: 450000000,
        tipo: "apartamento",
        habitaciones: 3,
        baños: 3,
        area_m2: 125,
        imagen_principal: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
        galeria: [
            "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800"
        ],
        slug: "apartamento-lujo-la-riviera-cucuta",
    },
    {
        id: "cuc-2",
        titulo: "Casa Residencial en Caobos",
        descripcion: "Amplia casa de dos niveles en el barrio Caobos, ideal para oficinas o vivienda familiar. Excelente ubicación cerca de centros comerciales y clínicas. Cuenta con garaje para dos vehículos.",
        ciudad: "Cúcuta",
        barrio: "Caobos",
        precio: 580000000,
        tipo: "casa",
        habitaciones: 4,
        baños: 4,
        area_m2: 210,
        imagen_principal: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=800",
        galeria: [
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800"
        ],
        slug: "casa-residencial-caobos-cucuta",
    },
    {
        id: "cuc-3",
        titulo: "Apartamento Moderno en Quinta Oriental",
        descripcion: "Apartamento recién remodelado en Quinta Oriental. Cerca a la Universidad Francisco de Paula Santander. Excelente iluminación natural y ventilación.",
        ciudad: "Cúcuta",
        barrio: "Quinta Oriental",
        precio: 210000000,
        tipo: "apartamento",
        habitaciones: 2,
        baños: 2,
        area_m2: 72,
        imagen_principal: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
        galeria: [],
        slug: "apartamento-moderno-quinta-oriental",
    },
    // Los Patios
    {
        id: "pat-1",
        titulo: "Casa en Conjunto Cerrado Tierra Linda",
        descripcion: "Hermosa casa en el mejor sector de Los Patios. Conjunto cerrado con vigilancia 24/7, piscinas, canchas múltiples y zonas verdes. Ambiente tranquilo y seguro.",
        ciudad: "Los Patios",
        barrio: "Tierra Linda",
        precio: 380000000,
        tipo: "casa",
        habitaciones: 3,
        baños: 3,
        area_m2: 140,
        imagen_principal: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
        galeria: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
        ],
        slug: "casa-conjunto-tierra-linda-los-patios",
    },
    {
        id: "pat-2",
        titulo: "Casa Campestre en Valles del Mirador",
        descripcion: "Propiedad única con amplio terreno y árboles frutales. Ubicada en una zona alta con clima fresco y vista privilegiada sobre el valle. Ideal para descanso.",
        ciudad: "Los Patios",
        barrio: "Valles del Mirador",
        precio: 620000000,
        tipo: "casa",
        habitaciones: 4,
        baños: 4,
        area_m2: 350,
        imagen_principal: "https://images.unsplash.com/photo-1500315331616-db4f707c24d1?auto=format&fit=crop&q=80&w=800",
        galeria: [],
        slug: "casa-campestre-valles-mirador",
    },
    {
        id: "pat-3",
        titulo: "Lote Urbanizado en Pinar del Río",
        descripcion: "Lote listo para construir en una de las zonas de mayor valorización en Los Patios. Cuenta con todas las acometidas de servicios públicos y vías pavimentadas.",
        ciudad: "Los Patios",
        barrio: "Pinar del Río",
        precio: 150000000,
        tipo: "lote",
        habitaciones: 0,
        baños: 0,
        area_m2: 250,
        imagen_principal: "https://images.unsplash.com/photo-1500382017468-9049fee780cf?auto=format&fit=crop&q=80&w=800",
        galeria: [],
        slug: "lote-pinar-del-rio-los-patios",
    },
    // Villa del Rosario
    {
        id: "ros-1",
        titulo: "Casa Nueva en La Parada",
        descripcion: "Casa moderna a estrenar en sector de expansión de Villa del Rosario. Cerca al puente internacional Simón Bolívar. Excelentes acabados y distribución.",
        ciudad: "Villa del Rosario",
        barrio: "La Parada",
        precio: 240000000,
        tipo: "casa",
        habitaciones: 3,
        baños: 2,
        area_m2: 98,
        imagen_principal: "https://images.unsplash.com/photo-1600566752355-3979ff69a3bc?auto=format&fit=crop&q=80&w=800",
        galeria: [],
        slug: "casa-nueva-la-parada-villa-rosario",
    },
    {
        id: "ros-2",
        titulo: "Casa Colonial en Centro Histórico",
        descripcion: "Propiedad con arquitectura tradicional conservada en el corazón de Villa del Rosario. Techos altos, patio central y ubicación inmejorable cerca al Parque Gran Colombiano.",
        ciudad: "Villa del Rosario",
        barrio: "Centro",
        precio: 320000000,
        tipo: "casa",
        habitaciones: 5,
        baños: 2,
        area_m2: 280,
        imagen_principal: "https://images.unsplash.com/photo-1549517045-bc93de075e53?auto=format&fit=crop&q=80&w=800",
        galeria: [],
        slug: "casa-colonial-centro-villa-rosario",
    },
    {
        id: "ros-3",
        titulo: "Casa Campestre en Juan Frío",
        descripcion: "Hermosa casa de descanso en el sector turístico de Juan Frío. Cuenta con piscina privada, zona de BBQ y amplios jardines. Perfecta para fines de semana.",
        ciudad: "Villa del Rosario",
        barrio: "Juan Frío",
        precio: 480000000,
        tipo: "casa",
        habitaciones: 4,
        baños: 3,
        area_m2: 400,
        imagen_principal: "https://images.unsplash.com/photo-1464890100888-a38e28b9cb81?auto=format&fit=crop&q=80&w=800",
        galeria: [
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800"
        ],
        slug: "casa-campestre-juan-frio",
    },
];

export const getPropertiesByCity = (city: Property["ciudad"]) => {
    return properties.filter((p) => p.ciudad === city);
};

export const getPropertyBySlug = (slug: string) => {
    return properties.find((p) => p.slug === slug);
};
