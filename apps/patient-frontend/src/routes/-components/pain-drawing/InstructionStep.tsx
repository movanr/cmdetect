import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INSTRUCTION_TEXT } from './constants';

export function InstructionStep() {
  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{INSTRUCTION_TEXT.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {INSTRUCTION_TEXT.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-muted-foreground">
              {paragraph}
            </p>
          ))}

          <div className="space-y-3 pt-2">
            {INSTRUCTION_TEXT.tools.map((tool) => (
              <div key={tool.name} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <span className="font-medium">{tool.name}:</span>{' '}
                  <span className="text-muted-foreground">{tool.description}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground pt-4 text-center">
            {INSTRUCTION_TEXT.footer}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
