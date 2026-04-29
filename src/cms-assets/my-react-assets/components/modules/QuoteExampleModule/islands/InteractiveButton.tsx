import { useState } from 'react';

export default function InteractiveButton({
  buttonLabel,
}: {
  buttonLabel: string;
}) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Click count: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>
        {buttonLabel}
      </button>
    </div>
  );
}
