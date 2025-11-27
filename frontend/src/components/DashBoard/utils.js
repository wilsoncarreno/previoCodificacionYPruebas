export const formatPrice = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatDateTime = (fecha, hora) => {
  if (!fecha && !hora) return "N/A";
  const candidate = hora ? `${fecha}T${hora}` : fecha;
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return `${fecha || ""} ${hora || ""}`.trim() || "N/A";
  const day = date.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
};

export const badgeClass = (tipo) => {
  if (tipo === "entrada") return "badge-success";
  if (tipo === "salida") return "badge-danger";
  return "badge-neutral";
};

export const tipoLabel = (tipo) => {
  if (tipo === "entrada") return "Entrada";
  if (tipo === "salida") return "Salida";
  return "Ajuste";
};
