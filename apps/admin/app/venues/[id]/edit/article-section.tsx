"use client";

import { Fragment, useMemo, type FC } from "react";
import type { EditorBlock as EditorBlockData } from "./article";
import { AddBlockBar } from "./add-block-bar";
import { EditorBlock } from "./editor-block";
import { useBlockReorder } from "./use-block-reorder";
import styles from "./article-section.module.css";

export type ArticleSectionProps = {
  readonly blocks: readonly EditorBlockData[];
  readonly onAddParagraph: () => void;
  readonly onAddPhoto: (file: File) => void;
  readonly onTextChange: (id: string, text: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onPhotoPick: (id: string, file: File) => void;
  readonly onPhotoRetry: (id: string) => void;
  readonly onMove: (id: string, insertionIndex: number) => void;
};

/**
 * La zone « Article » (bloc 4 de la spec, cadre `article` 157:1390) : les blocs dans l'ordre,
 * l'indicateur de dépôt (`DropIndicator`, 125:195) pendant un glisser, et sous le dernier bloc,
 * toujours, `AddBlockBar`.
 */
export const ArticleSection: FC<ArticleSectionProps> = ({
  blocks,
  onAddParagraph,
  onAddPhoto,
  onTextChange,
  onRemove,
  onPhotoPick,
  onPhotoRetry,
  onMove,
}) => {
  const blockIds = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const reorder = useBlockReorder({ blockIds, onMove });

  return (
    <section className={styles.article} aria-labelledby="article-title">
      <h2 id="article-title" className={styles.title}>
        Article
      </h2>
      <div className={styles.blocks} onDragOver={reorder.overList} onDrop={reorder.drop}>
        {blocks.map((block, index) => (
          <Fragment key={block.id}>
            {reorder.dropIndex === index ? <DropIndicator /> : null}
            <EditorBlock
              block={block}
              index={index}
              isDropSlot={reorder.draggedId === block.id}
              onTextChange={onTextChange}
              onRemove={onRemove}
              onPhotoPick={onPhotoPick}
              onPhotoRetry={onPhotoRetry}
              onDragStart={reorder.startDrag}
              onDragOver={reorder.overBlock}
              onDragEnd={reorder.endDrag}
              onHandleKeyDown={reorder.moveWithKeyboard}
            />
          </Fragment>
        ))}
        {reorder.dropIndex === blocks.length ? <DropIndicator /> : null}
        <AddBlockBar onAddParagraph={onAddParagraph} onAddPhoto={onAddPhoto} />
      </div>
    </section>
  );
};

/** Figma `DropIndicator` (125:195) : trait de 4 à l'accent, là où le bloc sera déposé. */
const DropIndicator: FC = () => {
  return <div className={styles.dropIndicator} aria-hidden="true" />;
};
