"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";

export function MainButtonBar() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  const handleScan = async () => {
    setScanning(true);
    setMessage("Scanning drive...");

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✓ ${data.message} Saved to ${data.databasePath}`);
      } else {
        setMessage(`✗ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8 self-center">
      <div className="flex gap-4">
        <Button onClick={() => router.push('/movies')}>
          Browse Movies
        </Button>
        <Button onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Rescan drive'}
        </Button>
      </div>
      <p className="min-h-8 text-sm text-gray-400 max-w-2xl text-center">{message || ""}</p>
    </div>
  );
}
