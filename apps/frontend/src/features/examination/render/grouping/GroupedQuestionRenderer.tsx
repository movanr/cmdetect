import type { QuestionInstance } from "../../model/instance/questionInstance";
import { QuestionRenderer } from "../QuestionRenderer";

type Props = {
  instances: QuestionInstance[];
  groupBy: (keyof QuestionInstance["context"])[];
  level?: number;
};

export function GroupedQuestionRenderer({ instances, groupBy, level = 0 }: Props) {
  if (groupBy.length === 0) {
    return (
      <div className="space-y-3">
        {instances.map((instance) => (
          <QuestionRenderer key={instance.instanceId} instance={instance} />
        ))}
      </div>
    );
  }

  const key = groupBy[0];
  const rest = groupBy.slice(1);

  const groups = instances.reduce<Record<string, QuestionInstance[]>>((acc, instance) => {
    const value = instance.context[key];
    if (!value) return acc;
    acc[value] ??= [];
    acc[value].push(instance);
    return acc;
  }, {});

  const HeadingTag = level === 0 ? "h2" : level === 1 ? "h3" : "h4";

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([value, group]) => (
        <section key={value} className="space-y-4">
          <HeadingTag className="font-semibold capitalize">{value}</HeadingTag>

          <div className="pl-4">
            <GroupedQuestionRenderer instances={group} groupBy={rest} level={level + 1} />
          </div>
        </section>
      ))}
    </div>
  );
}
