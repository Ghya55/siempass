"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type FC, type MouseEvent } from "react";
import { AdminSidebar } from "../../../components/admin-sidebar";
import { toPreviewData, type EditorVenueRow, type StoredArticle } from "./article";
import { ArticleSection } from "./article-section";
import { EditorHeader, VENUES_PATH } from "./editor-header";
import { FormAlert } from "./form-alert";
import { HeaderPhotoField } from "./header-photo-field";
import { LeaveDialog } from "./leave-dialog";
import { useArticleSave } from "./use-article-save";
import { useVenueArticle } from "./use-venue-article";
import { VenuePreview } from "./venue-preview";
import styles from "./venue-editor-screen.module.css";

export type VenueEditorScreenProps = {
  readonly venue: EditorVenueRow;
  readonly initialArticle: StoredArticle;
  /** Adresse du compte connecté, pour la barre latérale. */
  readonly signedInEmail: string;
};

/**
 * L'éditeur pleine page de l'article d'un lieu (bloc 4 de specs/venues.md) — Figma 128:244
 * (vide), 128:450 (rempli), 128:740 (bloc en déplacement), 128:1241 (échec d'envoi).
 * À gauche la photo d'en-tête et l'article, à droite la fiche publique en direct.
 */
export const VenueEditorScreen: FC<VenueEditorScreenProps> = ({ venue, initialArticle, signedInEmail }) => {
  const router = useRouter();
  const article = useVenueArticle(venue.id, initialArticle);
  const saving = useArticleSave(venue.id, initialArticle, article.stored);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const previewData = useMemo(() => toPreviewData(venue, article.stored), [venue, article.stored]);

  const back = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (saving.hasUnsavedChanges) {
        event.preventDefault();
        setIsLeaveDialogOpen(true);
      }
    },
    [saving.hasUnsavedChanges],
  );
  const leave = useCallback(() => {
    setIsLeaveDialogOpen(false);
    router.push(VENUES_PATH);
  }, [router]);
  const stay = useCallback(() => {
    setIsLeaveDialogOpen(false);
  }, []);

  return (
    <div className={styles.screen}>
      <AdminSidebar adresse={signedInEmail} />
      <div className={styles.main}>
        <EditorHeader
          name={venue.nom}
          state={venue.etat}
          isSaveDisabled={saving.isSaving || article.isUploading}
          onSave={saving.save}
          onBack={back}
        />
        <div className={styles.body}>
          <div className={styles.form}>
            {saving.error === null ? null : <FormAlert message={saving.error} />}
            <HeaderPhotoField
              headerPhoto={article.headerPhoto}
              onPick={article.changeHeaderPhoto}
              onRetry={article.retryHeaderPhoto}
            />
            <ArticleSection
              blocks={article.blocks}
              onAddParagraph={article.addParagraph}
              onAddPhoto={article.addPhoto}
              onTextChange={article.changeText}
              onRemove={article.removeBlock}
              onPhotoPick={article.changeBlockPhoto}
              onPhotoRetry={article.retryBlockPhoto}
              onMove={article.moveBlockTo}
            />
          </div>
          <VenuePreview venue={previewData} />
        </div>
      </div>
      <LeaveDialog isOpen={isLeaveDialogOpen} onLeave={leave} onStay={stay} />
    </div>
  );
};
