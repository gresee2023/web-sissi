"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinGateProps {
  onSuccess: () => void;
}

export function PinGate({ onSuccess }: PinGateProps) {
  const [passphrase, setPassphrase] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verify = useCallback(async () => {
    const value = passphrase.trim();
    if (!value || isVerifying) return;

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: value }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        setError("暗号不对哦，再想想~");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        setPassphrase("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setIsVerifying(false);
    }
  }, [passphrase, isVerifying, onSuccess]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        verify();
      }
    },
    [verify]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-card rounded-3xl shadow-lg p-8 w-full max-w-xs text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          请输入暗号
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          输入专属暗号以解锁发布功能
        </p>

        <div className={cn(isShaking && "animate-shake")}>
          <input
            ref={inputRef}
            type="password"
            value={passphrase}
            onChange={(e) => {
              setPassphrase(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入暗号..."
            disabled={isVerifying}
            className={cn(
              "w-full h-12 text-center text-lg font-medium rounded-2xl border-2 outline-none transition-all duration-150",
              "bg-background",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20",
              isVerifying && "opacity-60"
            )}
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          onClick={verify}
          disabled={!passphrase.trim() || isVerifying}
          className={cn(
            "w-full mt-4 py-2.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200",
            passphrase.trim() && !isVerifying
              ? "bg-primary text-primary-foreground hover:brightness-105 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              验证中...
            </>
          ) : (
            "确认"
          )}
        </button>

        {error && (
          <p className="text-sm text-red-400 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
