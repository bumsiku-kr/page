import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Types
export interface DraftSnapshot {
  title: string;
  content: string;
  tags: string[];
  summary: string;
  slug: string;
}

interface EditorState {
  // Content
  title: string;
  content: string;
  tags: string[];
  summary: string;
  slug: string;

  // UI Mode
  isSplitMode: boolean;

  // Loading States
  isUploading: boolean;
  isManualSaving: boolean;
  isSummarizing: boolean;
  isGeneratingSlug: boolean;

  // Modal States
  showPublishModal: boolean;
  showDraftModal: boolean;

  // Tag Input (for publish modal)
  tagInput: string;
  showTagSuggestions: boolean;

  // Feedback
  isDragging: boolean;
  lastAutoSavedAt: Date | null;
}

interface EditorActions {
  // Content Actions
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setSummary: (summary: string) => void;
  setSlug: (slug: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  // UI Mode Actions
  toggleSplitMode: () => void;
  setIsSplitMode: (value: boolean) => void;

  // Loading State Actions
  setIsUploading: (value: boolean) => void;
  setIsManualSaving: (value: boolean) => void;
  setIsSummarizing: (value: boolean) => void;
  setIsGeneratingSlug: (value: boolean) => void;

  // Modal Actions
  openPublishModal: () => void;
  closePublishModal: () => void;
  openDraftModal: () => void;
  closeDraftModal: () => void;
  setShowDraftModal: (value: boolean) => void;

  // Tag Input Actions
  setTagInput: (value: string) => void;
  setShowTagSuggestions: (value: boolean) => void;

  // Feedback Actions
  setIsDragging: (value: boolean) => void;
  setLastAutoSavedAt: (date: Date | null) => void;

  // Batch Actions
  loadDraft: (draft: DraftSnapshot) => void;
  initializeFromProps: (values: Partial<DraftSnapshot>) => void;
  reset: () => void;
  getSnapshot: () => DraftSnapshot;
}

const initialState: EditorState = {
  title: '',
  content: '',
  tags: [],
  summary: '',
  slug: '',
  isSplitMode: true,
  isUploading: false,
  isManualSaving: false,
  isSummarizing: false,
  isGeneratingSlug: false,
  showPublishModal: false,
  showDraftModal: false,
  tagInput: '',
  showTagSuggestions: false,
  isDragging: false,
  lastAutoSavedAt: null,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Content Actions
    setTitle: title => set({ title }),
    setContent: content => set({ content }),
    setSummary: summary => set({ summary }),
    setSlug: slug => set({ slug }),
    setTags: tags => set({ tags }),
    addTag: tag =>
      set(state => {
        const trimmedTag = tag.trim();
        if (!trimmedTag || state.tags.includes(trimmedTag) || state.tags.length >= 10) {
          return state;
        }
        return { tags: [...state.tags, trimmedTag] };
      }),
    removeTag: tag =>
      set(state => ({
        tags: state.tags.filter(t => t !== tag),
      })),

    // UI Mode Actions
    toggleSplitMode: () => set(state => ({ isSplitMode: !state.isSplitMode })),
    setIsSplitMode: value => set({ isSplitMode: value }),

    // Loading State Actions
    setIsUploading: value => set({ isUploading: value }),
    setIsManualSaving: value => set({ isManualSaving: value }),
    setIsSummarizing: value => set({ isSummarizing: value }),
    setIsGeneratingSlug: value => set({ isGeneratingSlug: value }),

    // Modal Actions
    openPublishModal: () => set({ showPublishModal: true }),
    closePublishModal: () =>
      set({ showPublishModal: false, tagInput: '', showTagSuggestions: false }),
    openDraftModal: () => set({ showDraftModal: true }),
    closeDraftModal: () => set({ showDraftModal: false }),
    setShowDraftModal: value => set({ showDraftModal: value }),

    // Tag Input Actions
    setTagInput: value => set({ tagInput: value }),
    setShowTagSuggestions: value => set({ showTagSuggestions: value }),

    // Feedback Actions
    setIsDragging: value => set({ isDragging: value }),
    setLastAutoSavedAt: date => set({ lastAutoSavedAt: date }),

    // Batch Actions
    loadDraft: draft =>
      set({
        title: draft.title || '',
        content: draft.content || '',
        tags: draft.tags || [],
        summary: draft.summary || '',
        slug: draft.slug || '',
        showDraftModal: false,
      }),

    initializeFromProps: values =>
      set({
        title: values.title || '',
        content: values.content || '',
        tags: values.tags || [],
        summary: values.summary || '',
        slug: values.slug || '',
      }),

    reset: () => set(initialState),

    getSnapshot: () => {
      const { title, content, tags, summary, slug } = get();
      return { title, content, tags, summary, slug };
    },
  }))
);

// Selector hooks for optimized re-renders
export const useEditorContent = () =>
  useEditorStore(state => ({
    title: state.title,
    content: state.content,
    tags: state.tags,
    summary: state.summary,
    slug: state.slug,
  }));

export const useEditorUIMode = () =>
  useEditorStore(state => ({
    isSplitMode: state.isSplitMode,
  }));

export const useEditorLoading = () =>
  useEditorStore(state => ({
    isUploading: state.isUploading,
    isManualSaving: state.isManualSaving,
    isSummarizing: state.isSummarizing,
    isGeneratingSlug: state.isGeneratingSlug,
  }));

export const useEditorModals = () =>
  useEditorStore(state => ({
    showPublishModal: state.showPublishModal,
    showDraftModal: state.showDraftModal,
  }));

export const useEditorTagInput = () =>
  useEditorStore(state => ({
    tagInput: state.tagInput,
    showTagSuggestions: state.showTagSuggestions,
  }));

export const useEditorFeedback = () =>
  useEditorStore(state => ({
    isDragging: state.isDragging,
    lastAutoSavedAt: state.lastAutoSavedAt,
  }));
