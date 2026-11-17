import { useId, useState } from 'react';

export interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqListProps {
  items: FaqEntry[];
}

export function FaqList({ items }: FaqListProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const answerId = `${baseId}-${index}`;
        const isOpen = openIndex === index;

        return (
          <div className="faq" key={item.question}>
            <h3>
              <button
                type="button"
                className="faq__question"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span aria-hidden="true">{isOpen ? '-' : '+'}</span>
              </button>
            </h3>
            <div className="faq__answer" id={answerId} hidden={!isOpen}>
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
