import { imageMap, typedFigureIndex, type FigureData } from "../lib/figures";

interface FigureEmbedProps {
  figureId: string;
}

export function FigureEmbed({ figureId }: FigureEmbedProps) {
  const figureKey = `Figure ${figureId}`;
  const figure = typedFigureIndex[figureKey] as FigureData | undefined;

  if (!figure || !("images" in figure)) {
    return <em className="text-muted-foreground">Abbildung {figureId}</em>;
  }

  return (
    <figure className="my-6 not-prose">
      <div className="flex flex-wrap gap-2 justify-center bg-muted/30 rounded-lg p-4">
        {figure.images.map((img, i) => {
          const imageUrl = imageMap[img];
          if (!imageUrl) {
            return (
              <span key={i} className="text-sm text-muted-foreground">
                [Bild fehlt: {img}]
              </span>
            );
          }
          return (
            <img
              key={i}
              src={imageUrl}
              alt={`Abbildung ${figureId} - ${i + 1}`}
              className="max-h-48 object-contain rounded"
            />
          );
        })}
      </div>
      <figcaption className="text-center text-sm text-muted-foreground mt-2">
        Abbildung {figureId}: {figure.description}
      </figcaption>
    </figure>
  );
}

interface MultiFigureEmbedProps {
  figureIds: string[];
}

export function MultiFigureEmbed({ figureIds }: MultiFigureEmbedProps) {
  // Collect all images and descriptions from referenced figures
  const allImages: Array<{ url: string; figureId: string; index: number }> = [];
  const descriptions: string[] = [];

  for (const figureId of figureIds) {
    const figureKey = `Figure ${figureId}`;
    const figure = typedFigureIndex[figureKey] as FigureData | undefined;
    if (figure && "images" in figure) {
      figure.images.forEach((img, i) => {
        const imageUrl = imageMap[img];
        if (imageUrl) {
          allImages.push({ url: imageUrl, figureId, index: i });
        }
      });
      descriptions.push(`${figureId}: ${figure.description}`);
    }
  }

  if (allImages.length === 0) {
    return <em className="text-muted-foreground">Abbildungen {figureIds.join(" & ")}</em>;
  }

  return (
    <figure className="my-6 not-prose">
      <div className="flex flex-wrap gap-2 justify-center bg-muted/30 rounded-lg p-4">
        {allImages.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={`Abbildung ${img.figureId} - ${img.index + 1}`}
            className="max-h-48 object-contain rounded"
          />
        ))}
      </div>
      <figcaption className="text-center text-sm text-muted-foreground mt-2">
        {descriptions.map((desc, i) => (
          <span key={i}>
            {i > 0 && <br />}
            Abbildung {desc}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
