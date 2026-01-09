import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: number | string | null;
  onSave: (value: number | string | null) => void;
  isEditing: boolean;
  type?: 'number' | 'text';
  prefix?: string;
  className?: string;
  placeholder?: string;
}

export function EditableCell({
  value,
  onSave,
  isEditing,
  type = 'number',
  prefix = '',
  className,
  placeholder = '',
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleBlur = () => {
    if (type === 'number') {
      const numValue = parseFloat(localValue);
      onSave(isNaN(numValue) ? null : numValue);
    } else {
      onSave(localValue || null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value?.toString() || '');
      inputRef.current?.blur();
    }
  };

  if (!isEditing) {
    return (
      <span className={cn('font-mono text-sm', className)}>
        {prefix}{value ?? '-'}
      </span>
    );
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {prefix}
        </span>
      )}
      <Input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'h-8 text-sm font-mono',
          prefix ? 'pl-5' : '',
          className
        )}
      />
    </div>
  );
}
