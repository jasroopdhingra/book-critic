export default function Logo({ size = 22, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left page */}
      <path
        d="M12 5C10.5 3.8 8.5 3 6 3C4.5 3 3.2 3.3 2 3.8V19.2C3.2 18.7 4.5 18.4 6 18.4C8.5 18.4 10.5 19.2 12 20.4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <path
        d="M12 5C13.5 3.8 15.5 3 18 3C19.5 3 20.8 3.3 22 3.8V19.2C20.8 18.7 19.5 18.4 18 18.4C15.5 18.4 13.5 19.2 12 20.4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spine */}
      <line
        x1="12"
        y1="5"
        x2="12"
        y2="20.4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
