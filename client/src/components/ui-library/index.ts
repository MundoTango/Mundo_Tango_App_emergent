// MT Ocean Component Library Index
// ESA LIFE CEO 61x21 UI Components

// Buttons
export { default as MTButton } from './buttons/MTButton';
export type { MTButtonProps } from './buttons/MTButton';

// Cards
export { default as MTCard } from './cards/MTCard';
export type { MTCardProps } from './cards/MTCard';

// Forms - Complete Form Component Suite
export { default as MTForm, MTFormSection, MTFormButton } from './forms/MTForm';
export type { MTFormProps } from './forms/MTForm';

export { default as MTFormField } from './forms/MTFormField';
export type { MTFormFieldProps } from './forms/MTFormField';

export { default as MTFormSelect } from './forms/MTFormSelect';
export type { MTFormSelectProps, MTFormSelectOption } from './forms/MTFormSelect';

export { default as MTFormTextarea } from './forms/MTFormTextarea';
export type { MTFormTextareaProps } from './forms/MTFormTextarea';

export { default as MTFormCheckbox, MTFormCheckboxGroup } from './forms/MTFormCheckbox';
export type { MTFormCheckboxProps, MTFormCheckboxGroupProps } from './forms/MTFormCheckbox';

export { default as MTFormRadioGroup, MTFormRadioCards } from './forms/MTFormRadioGroup';
export type { MTFormRadioGroupProps, MTFormRadioOption } from './forms/MTFormRadioGroup';

export { default as MTFormDatePicker, MTFormDateRangePicker } from './forms/MTFormDatePicker';
export type { MTFormDatePickerProps, MTFormDateRangePickerProps } from './forms/MTFormDatePicker';

export { default as MTFormFileUpload } from './forms/MTFormFileUpload';
export type { MTFormFileUploadProps } from './forms/MTFormFileUpload';

// Legacy form input (deprecated - use MTFormField instead)
export { default as MTInput } from './forms/MTInput';
export type { MTInputProps } from './forms/MTInput';

// Modals & Overlays - Phase 9 Complete Component Suite
export { default as MTModal } from './modals/MTModal';
export type { MTModalProps } from './modals/MTModal';

export { default as MTModalBase } from './modals/MTModalBase';
export type { MTModalBaseProps } from './modals/MTModalBase';

export { default as MTConfirmModal, useConfirmModal } from './modals/MTConfirmModal';
export type { MTConfirmModalProps } from './modals/MTConfirmModal';

export { default as MTAlertModal, useAlertStack } from './modals/MTAlertModal';
export type { MTAlertModalProps } from './modals/MTAlertModal';

export { default as MTFormModal, MTValidatedFormModal } from './modals/MTFormModal';
export type { MTFormModalProps } from './modals/MTFormModal';

export { default as MTImageModal } from './modals/MTImageModal';
export type { MTImageModalProps } from './modals/MTImageModal';

export { default as MTDrawer, useDrawerStack } from './modals/MTDrawer';
export type { MTDrawerProps } from './modals/MTDrawer';

export { default as MTTooltip, TooltipProvider, QuickTooltip } from './modals/MTTooltip';
export type { MTTooltipProps } from './modals/MTTooltip';

export { default as MTPopover, MTPopoverMenu } from './modals/MTPopover';
export type { MTPopoverProps } from './modals/MTPopover';

// Badges
export { default as MTBadge } from './badges/MTBadge';
export type { MTBadgeProps } from './badges/MTBadge';

// Tables - Phase 10 Complete Component Suite
export { default as MTTable } from './tables/MTTable';
export type { MTTableProps, MTTableColumn } from './tables/MTTable';

export { default as MTDataTable } from './tables/MTDataTable';
export type { MTDataTableProps } from './tables/MTDataTable';

export { default as MTTableHeader } from './tables/MTTableHeader';
export type { MTTableHeaderProps } from './tables/MTTableHeader';

export { default as MTTableRow } from './tables/MTTableRow';
export type { MTTableRowProps } from './tables/MTTableRow';

export { default as MTTableCell } from './tables/MTTableCell';
export type { MTTableCellProps } from './tables/MTTableCell';

export { default as MTTablePagination } from './tables/MTTablePagination';
export type { MTTablePaginationProps } from './tables/MTTablePagination';

export { default as MTTableFilter } from './tables/MTTableFilter';
export type { MTTableFilterProps } from './tables/MTTableFilter';

export { default as MTTableActions } from './tables/MTTableActions';
export type { MTTableActionsProps } from './tables/MTTableActions';

// Lists - Phase 10 Complete Component Suite
export { default as MTList } from './lists/MTList';
export type { MTListProps, MTListItem } from './lists/MTList';

export { default as MTListItem } from './lists/MTListItem';
export type { MTListItemProps } from './lists/MTListItem';

export { default as MTVirtualList, VirtualListItem, useDynamicHeights } from './lists/MTVirtualList';
export type { MTVirtualListProps } from './lists/MTVirtualList';

export { default as MTInfiniteList, useInfiniteListState } from './lists/MTInfiniteList';
export type { MTInfiniteListProps } from './lists/MTInfiniteList';

export { default as MTGridList } from './lists/MTGridList';
export type { MTGridListProps, MTGridListItem } from './lists/MTGridList';

export { default as MTTimelineList } from './lists/MTTimelineList';
export type { MTTimelineListProps, MTTimelineItem } from './lists/MTTimelineList';

export { default as MTAccordionList, MTAccordionGroup } from './lists/MTAccordionList';
export type { MTAccordionListProps, MTAccordionItem, MTAccordionGroupProps } from './lists/MTAccordionList';

export { default as MTKanbanBoard } from './lists/MTKanbanBoard';
export type { MTKanbanBoardProps, MTKanbanCard, MTKanbanColumn } from './lists/MTKanbanBoard';

// Table & List Utilities
export * from '@/lib/table-utils';

// Modal Management System
export { 
  useModalStore, 
  modalManager,
  modalUtils as modalManagerUtils,
  type ModalConfig 
} from '@/lib/modal-manager';

export { 
  useModal,
  useToast,
  useConfirm,
  useFocusTrap,
  useScrollLock,
  useClickOutside,
  modalAnimations,
  modalUtils,
  zIndexManager,
  useToastStore 
} from '@/lib/modal-utils';

// Re-export theme utilities
export * from '@/styles/mt-ocean-theme';