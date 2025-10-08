import { useState } from 'react';
import { Calendar as CalendarIcon, X, Plus, Info } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { format, isWithinInterval, parseISO, isSameDay } from 'date-fns';

interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  guestCount: number;
}

interface BlockedDate {
  startDate: string;
  endDate: string;
  reason?: string;
}

interface BookingCalendarProps {
  homeId: number;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onUpdateBlockedDates: (blockedDates: BlockedDate[]) => Promise<void>;
  isUpdating?: boolean;
}

export function BookingCalendar({
  homeId,
  bookings,
  blockedDates,
  onUpdateBlockedDates,
  isUpdating = false,
}: BookingCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isBlockingDialogOpen, setIsBlockingDialogOpen] = useState(false);
  const [blockStartDate, setBlockStartDate] = useState<Date | undefined>();
  const [blockEndDate, setBlockEndDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState('');

  // Get date status
  const getDateStatus = (date: Date) => {
    // Check if date is blocked
    const isBlocked = blockedDates.some(block => {
      try {
        const start = parseISO(block.startDate);
        const end = parseISO(block.endDate);
        return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);
      } catch {
        return false;
      }
    });

    if (isBlocked) return 'blocked';

    // Check if date has a booking
    const booking = bookings.find(b => {
      try {
        const checkIn = parseISO(b.checkInDate);
        const checkOut = parseISO(b.checkOutDate);
        return (isWithinInterval(date, { start: checkIn, end: checkOut }) || 
                isSameDay(date, checkIn) || 
                isSameDay(date, checkOut)) &&
               b.status !== 'cancelled' && b.status !== 'rejected';
      } catch {
        return false;
      }
    });

    if (booking?.status === 'approved') return 'approved';
    if (booking?.status === 'pending') return 'pending';

    return 'available';
  };

  // Custom day renderer with color coding
  const modifiers = {
    available: (date: Date) => getDateStatus(date) === 'available',
    pending: (date: Date) => getDateStatus(date) === 'pending',
    approved: (date: Date) => getDateStatus(date) === 'approved',
    blocked: (date: Date) => getDateStatus(date) === 'blocked',
  };

  const modifiersStyles = {
    available: {
      backgroundColor: 'transparent',
      color: '#1f2937',
    },
    pending: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      fontWeight: 'bold',
    },
    approved: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      fontWeight: 'bold',
    },
    blocked: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      fontWeight: 'bold',
      textDecoration: 'line-through',
    },
  };

  const handleAddBlockedDates = async () => {
    if (!blockStartDate || !blockEndDate) {
      return;
    }

    const newBlockedDate: BlockedDate = {
      startDate: blockStartDate.toISOString(),
      endDate: blockEndDate.toISOString(),
      reason: blockReason || 'Blocked by host',
    };

    const updatedBlockedDates = [...blockedDates, newBlockedDate];
    await onUpdateBlockedDates(updatedBlockedDates);

    // Reset dialog
    setIsBlockingDialogOpen(false);
    setBlockStartDate(undefined);
    setBlockEndDate(undefined);
    setBlockReason('');
  };

  const handleRemoveBlockedDate = async (index: number) => {
    const updatedBlockedDates = blockedDates.filter((_, i) => i !== index);
    await onUpdateBlockedDates(updatedBlockedDates);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="w-5 h-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 bg-[var(--color-surface-elevated)] rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--color-surface)] border border-gray-300 dark:border-gray-600"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-100 border border-yellow-300"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border border-green-300"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-100 border border-red-300"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">Blocked</span>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
              data-testid="calendar-availability"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsBlockingDialogOpen(true)}
              variant="outline"
              className="gap-2"
              data-testid="button-block-dates"
            >
              <Plus className="w-4 h-4" />
              Block Dates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates List */}
      {blockedDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockedDates.map((block, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  data-testid={`blocked-date-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-900">
                        {format(parseISO(block.startDate), 'MMM dd, yyyy')} - {format(parseISO(block.endDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {block.reason && (
                      <p className="text-sm text-red-700 ml-6">{block.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBlockedDate(index)}
                    className="text-red-600 hover:bg-red-100"
                    data-testid={`button-remove-block-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bookings */}
      {bookings.filter(b => b.status === 'approved' || b.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings
                .filter(b => b.status === 'approved' || b.status === 'pending')
                .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`flex items-start justify-between p-3 rounded-lg border ${
                      booking.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                    data-testid={`booking-preview-${booking.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className={`w-4 h-4 ${booking.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span className={`font-medium ${booking.status === 'approved' ? 'text-green-900' : 'text-yellow-900'}`}>
                          {format(parseISO(booking.checkInDate), 'MMM dd')} - {format(parseISO(booking.checkOutDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className={`text-sm ml-6 ${booking.status === 'approved' ? 'text-green-700' : 'text-yellow-700'}`}>
                        {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={booking.status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block Dates Dialog */}
      <Dialog open={isBlockingDialogOpen} onOpenChange={setIsBlockingDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-block-dates">
          <DialogHeader>
            <DialogTitle>Block Dates</DialogTitle>
            <DialogDescription>
              Select dates to block for personal use or maintenance. These dates will be unavailable for bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="block-start-date">Start Date</Label>
                <Input
                  id="block-start-date"
                  type="date"
                  value={blockStartDate ? format(blockStartDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setBlockStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="mt-2"
                  data-testid="input-block-start-date"
                />
              </div>
              <div>
                <Label htmlFor="block-end-date">End Date</Label>
                <Input
                  id="block-end-date"
                  type="date"
                  value={blockEndDate ? format(blockEndDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setBlockEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                  min={blockStartDate ? format(blockStartDate, 'yyyy-MM-dd') : undefined}
                  className="mt-2"
                  data-testid="input-block-end-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="block-reason">Reason (optional)</Label>
              <Textarea
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Personal use, Maintenance, Renovation"
                rows={3}
                className="mt-2"
                data-testid="textarea-block-reason"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Blocked dates will prevent guests from requesting bookings during this period. Existing approved bookings are not affected.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBlockingDialogOpen(false);
                setBlockStartDate(undefined);
                setBlockEndDate(undefined);
                setBlockReason('');
              }}
              disabled={isUpdating}
              data-testid="button-cancel-block"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBlockedDates}
              disabled={!blockStartDate || !blockEndDate || isUpdating}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-block"
            >
              {isUpdating ? 'Blocking...' : 'Block Dates'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
