interface Props {
  animationType: string;
  size?: number;
}

export default function WorkoutAnimation({ animationType, size = 80 }: Props) {
  const type = animationType.toLowerCase();

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <style>{`
        @keyframes squat-body { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(12px) scaleY(0.75)} }
        @keyframes squat-legs { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(25deg)} }
        @keyframes pushup-body { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(10px) rotate(5deg)} }
        @keyframes run-body { 0%,100%{transform:translateX(-4px) rotate(-3deg)} 50%{transform:translateX(4px) rotate(3deg)} }
        @keyframes run-leg1 { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(40deg)} }
        @keyframes run-leg2 { 0%,100%{transform:rotate(40deg)} 50%{transform:rotate(-30deg)} }
        @keyframes run-arm1 { 0%,100%{transform:rotate(40deg)} 50%{transform:rotate(-30deg)} }
        @keyframes run-arm2 { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(40deg)} }
        @keyframes plank-breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.05)} }
        @keyframes crunch-body { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(20deg)} }
        @keyframes pulse-glow { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
        @keyframes jump-body { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-14px)} 60%{transform:translateY(-14px)} }
      `}</style>

      {type === "squat" && (
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle cx="40" cy="12" r="7" fill="#2F8F7A" />
          <g
            style={{
              animation: "squat-body 1.2s ease-in-out infinite",
              transformOrigin: "40px 35px",
            }}
          >
            <rect x="34" y="20" width="12" height="20" rx="4" fill="#2F8F7A" />
            <line
              x1="34"
              y1="28"
              x2="20"
              y2="38"
              stroke="#7FCB8D"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="46"
              y1="28"
              x2="60"
              y2="38"
              stroke="#7FCB8D"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <g
            style={{
              animation: "squat-legs 1.2s ease-in-out infinite",
              transformOrigin: "40px 40px",
            }}
          >
            <line
              x1="36"
              y1="40"
              x2="28"
              y2="62"
              stroke="#2F8F7A"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="44"
              y1="40"
              x2="52"
              y2="62"
              stroke="#2F8F7A"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="62"
              x2="22"
              y2="72"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="52"
              y1="62"
              x2="58"
              y2="72"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {type === "pushup" && (
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
        >
          <g
            style={{
              animation: "pushup-body 1.4s ease-in-out infinite",
              transformOrigin: "40px 45px",
            }}
          >
            <circle cx="15" cy="38" r="6" fill="#2F8F7A" />
            <rect x="18" y="34" width="34" height="10" rx="4" fill="#2F8F7A" />
            <line
              x1="52"
              y1="36"
              x2="65"
              y2="44"
              stroke="#7FCB8D"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="52"
              y1="42"
              x2="65"
              y2="50"
              stroke="#7FCB8D"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="44"
              x2="14"
              y2="58"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="44"
              x2="24"
              y2="58"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {type === "run" && (
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
        >
          <g
            style={{
              animation: "run-body 0.6s ease-in-out infinite",
              transformOrigin: "40px 35px",
            }}
          >
            <circle cx="40" cy="12" r="7" fill="#2F8F7A" />
            <rect x="34" y="20" width="12" height="22" rx="4" fill="#2F8F7A" />
            <g
              style={{
                animation: "run-arm1 0.6s ease-in-out infinite",
                transformOrigin: "34px 26px",
              }}
            >
              <line
                x1="34"
                y1="26"
                x2="20"
                y2="38"
                stroke="#7FCB8D"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
            <g
              style={{
                animation: "run-arm2 0.6s ease-in-out infinite",
                transformOrigin: "46px 26px",
              }}
            >
              <line
                x1="46"
                y1="26"
                x2="60"
                y2="38"
                stroke="#7FCB8D"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
            <g
              style={{
                animation: "run-leg1 0.6s ease-in-out infinite",
                transformOrigin: "38px 42px",
              }}
            >
              <line
                x1="38"
                y1="42"
                x2="28"
                y2="60"
                stroke="#2F8F7A"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1="28"
                y1="60"
                x2="18"
                y2="72"
                stroke="#1F5B46"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
            <g
              style={{
                animation: "run-leg2 0.6s ease-in-out infinite",
                transformOrigin: "42px 42px",
              }}
            >
              <line
                x1="42"
                y1="42"
                x2="52"
                y2="60"
                stroke="#2F8F7A"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1="52"
                y1="60"
                x2="62"
                y2="72"
                stroke="#1F5B46"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </g>
        </svg>
      )}

      {type === "plank" && (
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
        >
          <g
            style={{
              animation: "plank-breathe 2s ease-in-out infinite",
              transformOrigin: "40px 45px",
            }}
          >
            <circle cx="12" cy="40" r="6" fill="#2F8F7A" />
            <rect x="16" y="38" width="40" height="8" rx="3" fill="#2F8F7A" />
            <line
              x1="16"
              y1="43"
              x2="8"
              y2="58"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="43"
              x2="18"
              y2="58"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="43"
              x2="46"
              y2="58"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="56"
              y1="43"
              x2="52"
              y2="58"
              stroke="#1F5B46"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {type === "crunch" && (
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
        >
          <g
            style={{
              animation: "crunch-body 1.2s ease-in-out infinite",
              transformOrigin: "40px 50px",
            }}
          >
            <circle cx="26" cy="22" r="7" fill="#2F8F7A" />
            <rect x="22" y="30" width="12" height="18" rx="4" fill="#2F8F7A" />
            <line
              x1="22"
              y1="36"
              x2="10"
              y2="46"
              stroke="#7FCB8D"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="34"
              y1="36"
              x2="46"
              y2="46"
              stroke="#7FCB8D"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <line
            x1="20"
            y1="58"
            x2="60"
            y2="58"
            stroke="#E6E8EB"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="22"
            y1="48"
            x2="28"
            y2="58"
            stroke="#2F8F7A"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="32"
            y1="48"
            x2="38"
            y2="58"
            stroke="#2F8F7A"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {!["squat", "pushup", "run", "plank", "crunch"].includes(type) && (
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="28"
            fill="#DDF2E3"
            style={{ animation: "pulse-glow 1.5s ease-in-out infinite" }}
          />
          <circle cx="40" cy="18" r="7" fill="#2F8F7A" />
          <rect x="34" y="26" width="12" height="20" rx="4" fill="#2F8F7A" />
          <line
            x1="34"
            y1="32"
            x2="20"
            y2="40"
            stroke="#7FCB8D"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="46"
            y1="32"
            x2="60"
            y2="40"
            stroke="#7FCB8D"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="36"
            y1="46"
            x2="30"
            y2="62"
            stroke="#2F8F7A"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="44"
            y1="46"
            x2="50"
            y2="62"
            stroke="#2F8F7A"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
