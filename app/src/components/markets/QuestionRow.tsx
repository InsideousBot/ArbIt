import type { QuestionResponse } from '../../lib/types';

interface QuestionRowProps {
  question: QuestionResponse;
  inPair: boolean;
}

export default function QuestionRow({ question, inPair }: QuestionRowProps) {
  return (
    <div className="px-3 py-2 border-b border-border flex items-start gap-2 hover:bg-surface transition-colors">
      <span className={`text-xs shrink-0 mt-0.5 ${inPair ? 'text-orange' : 'text-transparent'}`}>◆</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-snug truncate ${inPair ? 'text-text-primary' : 'text-text-secondary'}`}>
          {question.text}
        </p>
        <span className="text-[10px] text-text-muted mt-0.5 block">
          p = {question.price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
