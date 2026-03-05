"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 4;
const CORRECT_PIN = "0812";

interface PinGateProps {
  onSuccess: () => void;
}

export function PinGate({ onSuccess }: PinGateProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const resetAll = useCallback(() => {
    setDigits(Array(PIN_LENGTH).fill(""));
    setTimeout(() => focusInput(0), 50);
  }, [focusInput]);

  const verify = useCallback(
    (pin: string) => {
      if (pin === CORRECT_PIN) {
        setError(null);
        setTimeout(() => onSuccess(), 200);
      } else {
        setError("密码错误，再试试~");
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          resetAll();
        }, 400);
      }
    },
    [onSuccess, resetAll]
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digit
      const char = value.replace(/\D/g, "").slice(-1);
      if (!char) return;

      const next = [...digits];
      next[index] = char;
      setDigits(next);
      setError(null);

      if (index < PIN_LENGTH - 1) {
        focusInput(index + 1);
      }

      // Auto-verify when all filled
      if (next.every((d) => d !== "")) {
        verify(next.join(""));
      }
    },
    [digits, focusInput, verify]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const next = [...digits];
        if (digits[index]) {
          next[index] = "";
          setDigits(next);
        } else if (index > 0) {
          next[index - 1] = "";
          setDigits(next);
          focusInput(index - 1);
        }
      }
    },
    [digits, focusInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
      if (!pasted) return;

      const next = Array(PIN_LENGTH).fill("");
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);

      if (pasted.length >= PIN_LENGTH) {
        verify(next.join(""));
      } else {
        focusInput(pasted.length);
      }
    },
    [focusInput, verify]
  );

  useEffect(() => {
    focusInput(0);
  }, [focusInput]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-card rounded-3xl shadow-lg p-8 w-full max-w-xs text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          输入密码
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          请输入 4 位数字密码以继续
        </p>

        <div
          className={cn("flex justify-center gap-3", isShaking && "animate-shake")}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={cn(
                "w-14 h-14 text-center text-2xl font-semibold rounded-2xl border-2 outline-none transition-all duration-150",
                "bg-background",
                error
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
              autoComplete="off"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-400 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
