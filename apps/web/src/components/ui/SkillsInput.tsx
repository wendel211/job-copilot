import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from './Badge';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
}

export function SkillsInput({ value = [], onChange, disabled }: SkillsInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Digite uma skill e aperte Enter (ex: React)"
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={!input.trim() || disabled}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <Badge key={skill} variant="blue">
            <span className="flex items-center gap-1">
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </Badge>
        ))}
        {value.length === 0 && (
          <span className="text-xs text-gray-400 italic">Nenhuma skill adicionada ainda.</span>
        )}
      </div>
    </div>
  );
}