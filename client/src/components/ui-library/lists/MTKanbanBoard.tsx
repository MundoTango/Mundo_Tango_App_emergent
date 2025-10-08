// MT Ocean Kanban Board - Drag & Drop Kanban Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState, useRef, DragEvent } from 'react';
import { Plus, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTKanbanCard {
  id: string | number;
  title: string;
  description?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  labels?: Array<{
    text: string;
    color: string;
  }>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date | string;
  attachments?: number;
  comments?: number;
  progress?: number;
  metadata?: Record<string, any>;
}

export interface MTKanbanColumn {
  id: string | number;
  title: string;
  cards: MTKanbanCard[];
  color?: string;
  maxCards?: number;
  wipLimit?: number;
  actions?: React.ReactNode;
}

export interface MTKanbanBoardProps {
  columns: MTKanbanColumn[];
  onCardMove?: (cardId: string | number, fromColumn: string | number, toColumn: string | number, newIndex: number) => void;
  onCardClick?: (card: MTKanbanCard, columnId: string | number) => void;
  onCardEdit?: (card: MTKanbanCard, columnId: string | number) => void;
  onCardDelete?: (cardId: string | number, columnId: string | number) => void;
  onColumnAdd?: () => void;
  onColumnEdit?: (column: MTKanbanColumn) => void;
  onColumnDelete?: (columnId: string | number) => void;
  renderCard?: (card: MTKanbanCard, columnId: string | number) => React.ReactNode;
  renderColumnHeader?: (column: MTKanbanColumn) => React.ReactNode;
  draggable?: boolean;
  showProgress?: boolean;
  showWipLimit?: boolean;
  className?: string;
  containerClassName?: string;
  columnClassName?: string;
  cardClassName?: string;
  glassmorphic?: boolean;
  testId?: string;
}

export default function MTKanbanBoard({
  columns,
  onCardMove,
  onCardClick,
  onCardEdit,
  onCardDelete,
  onColumnAdd,
  onColumnEdit,
  onColumnDelete,
  renderCard,
  renderColumnHeader,
  draggable = true,
  showProgress = true,
  showWipLimit = true,
  className,
  containerClassName,
  columnClassName,
  cardClassName,
  glassmorphic = true,
  testId = 'mt-kanban-board'
}: MTKanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<{
    card: MTKanbanCard;
    columnId: string | number;
  } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent, card: MTKanbanCard, columnId: string | number) => {
    if (!draggable) return;
    setDraggedCard({ card, columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, columnId: string | number, index?: number) => {
    if (!draggable || !draggedCard) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: DragEvent, columnId: string | number) => {
    if (!draggable || !draggedCard) return;
    e.preventDefault();
    
    if (onCardMove && draggedCard.columnId !== columnId) {
      const targetIndex = dragOverIndex !== null ? dragOverIndex : 
        columns.find(col => col.id === columnId)?.cards.length || 0;
      
      onCardMove(
        draggedCard.card.id,
        draggedCard.columnId,
        columnId,
        targetIndex
      );
    }
    
    setDraggedCard(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDueDate = (date?: Date | string) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-blue-600' };
    return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-gray-600 dark:text-gray-300' };
  };

  const containerStyles = glassmorphic ? applyGlassmorphism() : {};

  const renderKanbanCard = (card: MTKanbanCard, columnId: string | number) => {
    if (renderCard) {
      return renderCard(card, columnId);
    }

    const dueDate = formatDueDate(card.dueDate);

    return (
      <div
        draggable={draggable}
        onDragStart={(e) => handleDragStart(e, card, columnId)}
        className={cn(
          'p-3 rounded-lg cursor-move',
          'bg-[var(--color-surface)] dark:bg-gray-800',
          'border border-[var(--color-border)]/50 dark:border-gray-700/50',
          'hover:shadow-lg hover:scale-[1.02] transition-all duration-200',
          draggedCard?.card.id === card.id && 'opacity-50',
          cardClassName
        )}
        onClick={() => onCardClick?.(card, columnId)}
        data-testid={`${testId}-card-${card.id}`}
      >
        {/* Priority indicator */}
        {card.priority && (
          <div className={cn('h-1 -mx-3 -mt-3 mb-2 rounded-t-lg', getPriorityColor(card.priority))} />
        )}

        {/* Title */}
        <h4 className="font-medium text-[var(--color-text)] dark:text-gray-100 text-sm mb-1">
          {card.title}
        </h4>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {card.description}
          </p>
        )}

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.text}
              </span>
            ))}
          </div>
        )}

        {/* Progress */}
        {showProgress && card.progress !== undefined && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{card.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-ocean-400)] to-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {/* Assignee */}
            {card.assignee && (
              <div className="flex items-center gap-1">
                {card.assignee.avatar ? (
                  <img
                    src={card.assignee.avatar}
                    alt={card.assignee.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-ocean-400)] to-[var(--color-ocean-600)] flex items-center justify-center text-white text-xs">
                    {card.assignee.name.charAt(0)}
                  </div>
                )}
              </div>
            )}

            {/* Due date */}
            {dueDate && (
              <span className={cn('text-xs', dueDate.color)}>
                {dueDate.text}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {/* Attachments */}
            {card.attachments && card.attachments > 0 && (
              <span className="flex items-center gap-0.5">
                📎 {card.attachments}
              </span>
            )}

            {/* Comments */}
            {card.comments && card.comments > 0 && (
              <span className="flex items-center gap-0.5">
                💬 {card.comments}
              </span>
            )}
          </div>
        </div>

        {/* Card Actions */}
        {(onCardEdit || onCardDelete) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              {onCardEdit && (
                <button
                  onClick={(e) = aria-label="Button"> {
                    e.stopPropagation();
                    onCardEdit(card, columnId);
                  }}
                  className="p-1 hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-3 h-3" />
                </button>
              )}
              {onCardDelete && (
                <button
                  onClick={(e) = aria-label="Button"> {
                    e.stopPropagation();
                    onCardDelete(card.id, columnId);
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <Trash className="w-3 h-3 text-red-600" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'mt-kanban-board-container',
        glassmorphic && 'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30 p-4',
        containerClassName
      )}
      style={containerStyles}
      data-testid={testId}
    >
      <div className={cn(
        'flex gap-4 overflow-x-auto pb-4',
        className
      )}>
        {columns.map((column) => {
          const isOverLimit = column.wipLimit && column.cards.length > column.wipLimit;
          
          return (
            <div
              key={column.id}
              className={cn(
                'flex-shrink-0 w-80',
                'bg-[var(--color-surface-elevated)]/50 dark:bg-gray-800/50 rounded-xl',
                dragOverColumn === column.id && 'ring-2 ring-teal-400',
                columnClassName
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragEnd={handleDragEnd}
              data-testid={`${testId}-column-${column.id}`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[var(--color-border)]/50 dark:border-gray-700/50">
                {renderColumnHeader ? (
                  renderColumnHeader(column)
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {column.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                      )}
                      <h3 className="font-semibold text-[var(--color-text)] dark:text-gray-100">
                        {column.title}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {column.cards.length}
                      </span>
                      {showWipLimit && column.wipLimit && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          isOverLimit
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-[var(--color-neutral-100)] text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        )}>
                          WIP: {column.cards.length}/{column.wipLimit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {column.actions}
                      {onColumnEdit && (
                        <button
                          onClick={() = aria-label="Button"> onColumnEdit(column)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 min-h-[200px]">
                {column.cards.map((card, index) => (
                  <div
                    key={card.id}
                    onDragOver={(e) => handleDragOver(e, column.id, index)}
                    className="group"
                  >
                    {renderKanbanCard(card, column.id)}
                  </div>
                ))}
                
                {/* Add Card Button */}
                <button className="w-full p-2 text-sm text-gray-500 hover:text-[var(--color-text-secondary)] dark:hover:text-gray-300 hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Button">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add card
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Column Button */}
        {onColumnAdd && (
          <div className="flex-shrink-0">
            <button
              onClick={onColumnAdd}
              className="w-80 h-full min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-[var(--color-text-secondary)] dark:hover:text-gray-300 hover:border-teal-400 dark:hover:border-[var(--color-primary)] transition-colors"
             aria-label="Button">
              <Plus className="w-6 h-6 mr-2" />
              Add Column
            </button>
          </div>
        )}
      </div>
    </div>
  );
}