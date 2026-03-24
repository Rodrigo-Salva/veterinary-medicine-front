import React, { useEffect, useState } from "react";
import { petService } from "../services/api";
import { Pet } from "../types";
import {
  Loader2,
  Dog,
  Cat,
  Bird,
  Heart,
  AlertCircle,
  Clock,
} from "lucide-react";

const AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getSpeciesIcon = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes("dog") || s.includes("perro")) return <Dog size={14} />;
  if (s.includes("cat") || s.includes("gato")) return <Cat size={14} />;
  if (s.includes("bird") || s.includes("ave")) return <Bird size={14} />;
  return <Heart size={14} />;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  healthy: {
    label: "Healthy",
    color: "#059669",
    bg: "#d1fae5",
    icon: <Heart size={12} />,
  },
  treatment: {
    label: "Treatment",
    color: "#d97706",
    bg: "#fef3c7",
    icon: <AlertCircle size={12} />,
  },
  checkup: {
    label: "Checkup",
    color: "#2563eb",
    bg: "#dbeafe",
    icon: <Clock size={12} />,
  },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status = "healthy" }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.healthy;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        color: config.color,
        background: config.bg,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

const PetList: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | string | null>(null);

  useEffect(() => {
    petService
      .getAll()
      .then(setPets)
      .catch((e) => console.error("Error fetching pets:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "4rem",
          color: "#6366f1",
        }}
      >
        <Loader2 size={36} className="animate-spin" />
        <span style={{ fontSize: "14px", color: "#9ca3af" }}>
          Loading patients...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
        overflow: "hidden",
        width: "200%", // ← ocupa todo el ancho
        height: "100%", // ← ocupa toda la altura del padre
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Registered Patients
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            {pets.length} pets in the system
          </p>
        </div>
        <span
          style={{
            background: "#eef2ff",
            color: "#6366f1",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          All pets
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Pet", "Type", "Breed", "Status", "Age"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pets.length > 0 ? (
              pets.map((pet) => (
                <tr
                  key={pet.id}
                  onMouseEnter={() => setHoveredRow(pet.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    background: hoveredRow === pet.id ? "#fafbff" : "#fff",
                    transition: "background 0.15s",
                    cursor: "default",
                  }}
                >
                  {/* Name */}
                  <td style={{ padding: "14px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: getAvatarColor(pet.name),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "15px",
                          flexShrink: 0,
                        }}
                      >
                        {pet.name[0].toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#0f172a",
                        }}
                      >
                        {pet.name}
                      </span>
                    </div>
                  </td>

                  {/* Species */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      {getSpeciesIcon(pet.species)}
                      {pet.species}
                    </span>
                  </td>

                  {/* Breed */}
                  <td
                    style={{
                      padding: "14px 20px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    {pet.breed}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={(pet as any).status} />
                  </td>

                  {/* Age */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#0f172a",
                      }}
                    >
                      {pet.age}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginLeft: "3px",
                      }}
                    >
                      yrs
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "#94a3b8",
                    }}
                  >
                    <Heart
                      size={40}
                      style={{
                        margin: "0 auto 12px",
                        opacity: 0.3,
                        display: "block",
                      }}
                    />
                    <p style={{ margin: 0, fontWeight: 600, color: "#cbd5e1" }}>
                      No pets registered yet
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                      Patients will appear here once added.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetList;
