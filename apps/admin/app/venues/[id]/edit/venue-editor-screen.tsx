"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, type FC, type MouseEvent } from "react";
import { AdminShell } from "../../../components/admin-shell";
import { toPreviewData, type EditorVenueRow, type StoredArticle } from "./article";
import { ArticleSection } from "./article-section";
import { EditorHeader, VENUES_PATH } from "./editor-header";
import { FormAlert } from "./form-alert";
import { HeaderPhotoField } from "./header-photo-field";
import { LeaveDialog } from "./leave-dialog";
import { useArticleSave } from "./use-article-save";
import { useLeaveGuard } from "./use-leave-guard";
import { useVenueArticle } from "./use-venue-article";
import { VenuePreview } from "./venue-preview";
import styles from "./venue-editor-screen.module.css";

export type VenueEditorScreenProps = {
  readonly venue: EditorVenueRow;
  /** Prénom du compte auteur (« Written by », VEN-9), nul s'il n'en a pas. */
  readonly author: string | null;
  readonly initialArticle: StoredArticle;
  /** Adresse du compte connecté, pour la barre latérale. */
  readonly signedInEmail: string;
};

/**
 * L'éditeur pleine page de l'article d'un lieu (bloc 4 de specs/venues.md) — Figma 128:244
 * (vide), 128:450 (rempli), 128:740 (bloc en déplacement), 128:1241 (échec d'envoi).
 * À gauche la photo d'en-tête et l'article, à droite la fiche publique en direct.
 */
export const VenueEditorScreen: FC<VenueEditorScreenProps> = ({ venue, author, initialArticle, signedInEmail }) => {
  const router = useRouter();
  const article = useVenueArticle(venue.id, initialArticle);
  const saving = useArticleSave(venue.id, initialArticle, article.stored);
  const leaveGuard = useLeaveGuard(saving.hasUnsavedChanges);
  const { askToLeave } = leaveGuard;

  const previewData = useMemo(
    () => toPreviewData(venue, author, article.stored),
    [venue, author, article.stored],
  );

  const back = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (saving.hasUnsavedChanges) {
        event.preventDefault();
        askToLeave(() => {
          router.push(VENUES_PATH);
        });
      }
    },
    [saving.hasUnsavedChanges, askToLeave, router],
  );

  return (
    <AdminShell adresse={signedInEmail} demanderSortie={saving.hasUnsavedChanges ? askToLeave : undefined}>
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
        <div className={styles.previewColumn}>
          <VenuePreview venue={previewData} />
        </div>
      </div>
      <LeaveDialog isOpen={leaveGuard.isAsking} onLeave={leaveGuard.confirmLeave} onStay={leaveGuard.cancelLeave} />
    </AdminShell>
  );
};
