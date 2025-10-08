import { useState } from 'react';
import { Calendar, DollarSign, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TripConfig {
  startDate: string;
  endDate: string;
  tripDuration: number;
  budget: string;
  interests: string[];
  travelStyle: string;
}

interface TripConfigurationWizardProps {
  city: string;
  country?: string;
  onConfigComplete: (config: TripConfig) => void;
}

const INTEREST_OPTIONS = [
  'Tango Milongas',
  'Dance Classes',
  'Live Music',
  'Cultural Sites',
  'Food & Dining',
  'Shopping',
  'Nightlife',
  'Outdoor Activities',
  'Art & Museums',
  'Local Experiences'
];

export default function TripConfigurationWizard({ 
  city, 
  country, 
  onConfigComplete 
}: TripConfigurationWizardProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('medium');
  const [interests, setInterests] = useState<string[]>(['Tango Milongas']);
  const [travelStyle, setTravelStyle] = useState('solo');

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tripDuration = calculateDuration();

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || tripDuration === 0) {
      return;
    }

    onConfigComplete({
      startDate,
      endDate,
      tripDuration,
      budget,
      interests,
      travelStyle
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Plan Your Trip to {city}
        </h2>
        <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">
          Tell us your dates and preferences to see personalized recommendations
        </p>
      </div>

      {/* Date Selection */}
      <Card className="p-6 glass-card-depth-1">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-cyan-600" />
          <h3 className="font-semibold text-lg">When are you visiting?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full"
              data-testid="input-end-date"
            />
          </div>
        </div>

        {tripDuration > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Trip Duration: {tripDuration} {tripDuration === 1 ? 'day' : 'days'}
            </p>
          </div>
        )}
      </Card>

      {/* Budget */}
      <Card className="p-6 glass-card-depth-1">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-lg">What's your budget?</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['budget', 'medium', 'high', 'luxury'].map((level) => (
            <button
              key={level}
              onClick={() => setBudget(level)}
              className={`p-3 rounded-lg border-2 transition ${
                budget === level
                  ? 'border-ocean-500 bg-cyan-50 dark:bg-cyan-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
              }`}
              data-testid={`button-budget-${level}`}
            >
              <div className="text-sm font-medium capitalize">{level}</div>
              <div className="text-xs text-gray-500 mt-1">
                {level === 'budget' && '$'}
                {level === 'medium' && '$$'}
                {level === 'high' && '$$$'}
                {level === 'luxury' && '$$$$'}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Interests */}
      <Card className="p-6 glass-card-depth-1">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-pink-600" />
          <h3 className="font-semibold text-lg">What interests you?</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`p-2 rounded-lg border text-sm transition ${
                interests.includes(interest)
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
              }`}
              data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {interest}
            </button>
          ))}
        </div>
      </Card>

      {/* Travel Style */}
      <Card className="p-6 glass-card-depth-1">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-lg">Travel Style</h3>
        </div>

        <Select value={travelStyle} onValueChange={setTravelStyle}>
          <SelectTrigger className="w-full" data-testid="select-travel-style">
            <SelectValue placeholder="Select your travel style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solo">Solo Travel</SelectItem>
            <SelectItem value="couple">Couple</SelectItem>
            <SelectItem value="group">Group / Friends</SelectItem>
            <SelectItem value="family">Family</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!startDate || !endDate || tripDuration === 0}
        className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
        data-testid="button-find-activities"
      >
        Find Activities & Stays
      </Button>
    </div>
  );
}
