import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Toast, type ToastVariant } from './Toast';

export type ToastInput = {
  variant?: ToastVariant;
  message: string;
  action?: { label: string; onPress: () => void };
  durationMs?: number;
};

export type ToastEntry = ToastInput & { id: number };

type Ctx = {
  show: (_toast: ToastInput) => number;
  dismiss: (_id: number) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((t: ToastInput) => {
    const id = ++idRef.current;
    setItems((arr) => [...arr, { ...t, id }]);
    return id;
  }, []);

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: 60, left: 0, right: 0, paddingHorizontal: 16 }}
      >
        {items.map((t) => (
          <Toast key={t.id} entry={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastCtx.Provider>
  );
}
