export function getTimeUntilLabel(
  dateString: string,
): { label: string; className: string } | null {
  const now = new Date();
  const target = new Date(dateString);
  const diffDays = Math.floor(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0)
    return { label: "Aujourd'hui", className: "bg-blue-100 text-blue-800" };
  if (diffDays < 7 && diffDays > 0)
    return {
      label: "Dans moins d'une semaine",
      className: "bg-blue-100 text-blue-800",
    };
  if (diffDays >= 7 && diffDays < 14)
    return {
      label: "Dans 1 semaine",
      className: "bg-green-100 text-green-800",
    };
  if (diffDays >= 14 && diffDays < 30)
    return {
      label: "Dans 2 semaines",
      className: "bg-yellow-100 text-yellow-800",
    };
  if (diffDays >= 30 && diffDays < 60)
    return { label: "Dans 1 mois", className: "bg-orange-100 text-orange-800" };
  if (diffDays >= 60 && diffDays <= 90)
    return { label: "Dans 2 mois", className: "bg-red-100 text-red-800" };
  if (diffDays > 90)
    return {
      label: "Dans plus de 3 mois",
      className: "bg-gray-100 text-gray-800",
    };
  if (diffDays < 0)
    return { label: "Course passée", className: "bg-gray-100 text-gray-800" };

  return null;
}

export function isPastRace(dateString: string): boolean {
  const now = new Date();
  const target = new Date(dateString);
  return target.getTime() < now.getTime();
}
