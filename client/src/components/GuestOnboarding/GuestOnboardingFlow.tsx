import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ChevronLeft, Home, Utensils, Globe, Heart, Phone, MapPin, DollarSign, Calendar, X } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';

interface GuestProfileData {
  accommodationPreferences: {
    propertyTypes: string[];
    roomTypes: string[];
    amenities: string[];
  };
  dietaryRestrictions: string[];
  languagesSpoken: string[];
  travelInterests: string[];
  travelStyle: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  specialNeeds: string;
  preferredNeighborhoods: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  stayDurationPreference: string;
}

export function GuestOnboardingFlow() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState<GuestProfileData>({
    accommodationPreferences: {
      propertyTypes: [],
      roomTypes: [],
      amenities: []
    },
    dietaryRestrictions: [],
    languagesSpoken: [],
    travelInterests: [],
    travelStyle: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    specialNeeds: '',
    preferredNeighborhoods: [],
    budgetRange: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    stayDurationPreference: 'short'
  });

  const totalSteps = 6;

  const STEPS = [
    { id: 1, icon: Home, label: t('housing.guest_onboarding.step_accommodation', 'Accommodation') },
    { id: 2, icon: Utensils, label: t('housing.guest_onboarding.step_dietary', 'Dietary') },
    { id: 3, icon: Globe, label: t('housing.guest_onboarding.step_languages', 'Languages') },
    { id: 4, icon: MapPin, label: t('housing.guest_onboarding.step_location', 'Location') },
    { id: 5, icon: DollarSign, label: t('housing.guest_onboarding.step_budget', 'Budget') },
    { id: 6, icon: Phone, label: t('housing.guest_onboarding.step_emergency', 'Emergency') }
  ];

  const propertyTypes = ['Apartment', 'House', 'Townhouse', 'Loft', 'Studio', 'Villa'];
  const roomTypes = ['Entire place', 'Private room', 'Shared room'];
  const amenities = ['WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating', 'Workspace', 'TV', 'Parking', 'Elevator', 'Gym', 'Pool'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Dairy-free', 'Nut allergies', 'Seafood allergies'];
  const languages = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];
  const interests = ['Tango Dancing', 'Museums', 'Art Galleries', 'Live Music', 'Food Tours', 'Wine Tasting', 'Historical Sites', 'Shopping', 'Nature & Parks', 'Photography', 'Cooking Classes', 'Local Markets'];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheckboxChange = (category: string, value: string, checked: boolean) => {
    setProfileData(prev => {
      const newData = { ...prev };
      
      if (category === 'propertyTypes' || category === 'roomTypes' || category === 'amenities') {
        const preferences = { ...newData.accommodationPreferences };
        if (checked) {
          preferences[category] = [...preferences[category], value];
        } else {
          preferences[category] = preferences[category].filter(item => item !== value);
        }
        newData.accommodationPreferences = preferences;
      } else if (category === 'dietaryRestrictions' || category === 'languagesSpoken' || category === 'travelInterests' || category === 'preferredNeighborhoods') {
        if (checked) {
          newData[category] = [...newData[category], value];
        } else {
          newData[category] = newData[category].filter(item => item !== value);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('/api/guest-profile', {
        method: 'POST',
        body: profileData
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: t('housing.guest_onboarding.success_title', 'Profile Created!'),
          description: t('housing.guest_onboarding.success_description', 'Your guest profile has been saved successfully.'),
        });
        setLocation('/profile');
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (error: unknown) {
      console.error('Error saving guest profile:', error);
      toast({
        title: t('housing.guest_onboarding.error_title', 'Error'),
        description: t('housing.guest_onboarding.error_description', 'Failed to save your profile. Please try again.'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6" data-testid="guest-onboarding-accommodation">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white" data-testid="step-title-accommodation">
                {t('housing.guest_onboarding.accommodation_title', 'Accommodation Preferences')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400" data-testid="step-description-accommodation">
                {t('housing.guest_onboarding.accommodation_description', 'What type of place are you looking for?')}
              </p>
            </div>
            
            <div className="space-y-6">
              <div data-testid="section-property-types">
                <Label className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.property_types', 'Property Types')}
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {propertyTypes.map(type => {
                    const typeId = type.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={typeId}
                          data-testid={`checkbox-property-${typeId}`}
                          checked={profileData.accommodationPreferences.propertyTypes.includes(type)}
                          onCheckedChange={(checked) => handleCheckboxChange('propertyTypes', type, checked as boolean)}
                          aria-label={type}
                          className="border-cyan-300 dark:border-cyan-600"
                        />
                        <Label htmlFor={typeId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{type}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div data-testid="section-room-types">
                <Label className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.room_types', 'Room Types')}
                </Label>
                <div className="space-y-2 mt-3">
                  {roomTypes.map(type => {
                    const typeId = type.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={typeId}
                          data-testid={`checkbox-room-${typeId}`}
                          checked={profileData.accommodationPreferences.roomTypes.includes(type)}
                          onCheckedChange={(checked) => handleCheckboxChange('roomTypes', type, checked as boolean)}
                          className="border-cyan-300 dark:border-cyan-600"
                        />
                        <Label htmlFor={typeId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{type}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div data-testid="section-amenities">
                <Label className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.amenities', 'Must-Have Amenities')}
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {amenities.map(amenity => {
                    const amenityId = amenity.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenityId}
                          data-testid={`checkbox-amenity-${amenityId}`}
                          checked={profileData.accommodationPreferences.amenities.includes(amenity)}
                          onCheckedChange={(checked) => handleCheckboxChange('amenities', amenity, checked as boolean)}
                          className="border-cyan-300 dark:border-cyan-600"
                        />
                        <Label htmlFor={amenityId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{amenity}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6" data-testid="guest-onboarding-dietary">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white" data-testid="step-title-dietary">
                {t('housing.guest_onboarding.dietary_title', 'Dietary Preferences')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400" data-testid="step-description-dietary">
                {t('housing.guest_onboarding.dietary_description', 'Let us know about any dietary restrictions or preferences')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3" data-testid="section-dietary-restrictions">
              {dietaryOptions.map(diet => {
                const dietId = diet.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div key={diet} className="flex items-center space-x-2">
                    <Checkbox
                      id={dietId}
                      data-testid={`checkbox-dietary-${dietId}`}
                      checked={profileData.dietaryRestrictions.includes(diet)}
                      onCheckedChange={(checked) => handleCheckboxChange('dietaryRestrictions', diet, checked as boolean)}
                      className="border-cyan-300 dark:border-cyan-600"
                    />
                    <Label htmlFor={dietId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{diet}</Label>
                  </div>
                );
              })}
            </div>

            <div>
              <Label htmlFor="specialNeeds" className="text-slate-700 dark:text-slate-300">
                {t('housing.guest_onboarding.special_needs', 'Any special needs or additional requirements?')}
              </Label>
              <Textarea
                id="specialNeeds"
                data-testid="textarea-special-needs"
                placeholder={t('housing.guest_onboarding.special_needs_placeholder', 'E.g., wheelchair accessibility, medical conditions, etc.')}
                value={profileData.specialNeeds}
                onChange={(e) => setProfileData(prev => ({ ...prev, specialNeeds: e.target.value }))}
                className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6" data-testid="guest-onboarding-languages">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white" data-testid="step-title-languages-interests">
                {t('housing.guest_onboarding.languages_title', 'Languages & Interests')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400" data-testid="step-description-languages-interests">
                {t('housing.guest_onboarding.languages_description', 'Help us connect you with the right people and experiences')}
              </p>
            </div>
            
            <div data-testid="section-languages">
              <Label className="text-slate-700 dark:text-slate-300">
                {t('housing.guest_onboarding.languages_spoken', 'Languages You Speak')}
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {languages.map(lang => {
                  const langId = lang.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={langId}
                        data-testid={`checkbox-language-${langId}`}
                        checked={profileData.languagesSpoken.includes(lang)}
                        onCheckedChange={(checked) => handleCheckboxChange('languagesSpoken', lang, checked as boolean)}
                        className="border-cyan-300 dark:border-cyan-600"
                      />
                      <Label htmlFor={langId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{lang}</Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div data-testid="section-interests">
              <Label className="text-slate-700 dark:text-slate-300">
                {t('housing.guest_onboarding.interests', 'Your Interests')}
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {interests.map(interest => {
                  const interestId = interest.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interestId}
                        data-testid={`checkbox-interest-${interestId}`}
                        checked={profileData.travelInterests.includes(interest)}
                        onCheckedChange={(checked) => handleCheckboxChange('travelInterests', interest, checked as boolean)}
                        className="border-cyan-300 dark:border-cyan-600"
                      />
                      <Label htmlFor={interestId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{interest}</Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div data-testid="section-travel-style">
              <Label htmlFor="travelStyle" className="text-slate-700 dark:text-slate-300">
                {t('housing.guest_onboarding.travel_style', 'Travel Style')}
              </Label>
              <Select
                value={profileData.travelStyle}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, travelStyle: value }))}
              >
                <SelectTrigger className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800" data-testid="select-travel-style">
                  <SelectValue placeholder={t('housing.guest_onboarding.travel_style_placeholder', 'Select your travel style')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo-travel" data-testid="option-travel-style-solo-travel">
                    {t('housing.guest_onboarding.travel_style_solo', 'Solo Travel')}
                  </SelectItem>
                  <SelectItem value="couples" data-testid="option-travel-style-couples">
                    {t('housing.guest_onboarding.travel_style_couples', 'Couples')}
                  </SelectItem>
                  <SelectItem value="groups" data-testid="option-travel-style-groups">
                    {t('housing.guest_onboarding.travel_style_groups', 'Groups')}
                  </SelectItem>
                  <SelectItem value="family" data-testid="option-travel-style-family">
                    {t('housing.guest_onboarding.travel_style_family', 'Family')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6" data-testid="guest-onboarding-location">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white" data-testid="step-title-location">
                {t('housing.guest_onboarding.location_title', 'Location & Duration')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400" data-testid="step-description-location">
                {t('housing.guest_onboarding.location_description', 'Where do you want to stay and for how long?')}
              </p>
            </div>
            
            <div data-testid="section-neighborhoods">
              <Label className="text-slate-700 dark:text-slate-300">
                {t('housing.guest_onboarding.neighborhoods', 'Preferred Neighborhoods')}
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {t('housing.guest_onboarding.neighborhoods_hint', "Select neighborhoods you're interested in")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Palermo', 'Recoleta', 'San Telmo', 'La Boca', 'Puerto Madero', 'Belgrano', 'Villa Crespo', 'Almagro'].map(hood => {
                  const hoodId = hood.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div key={hood} className="flex items-center space-x-2">
                      <Checkbox
                        id={hoodId}
                        data-testid={`checkbox-neighborhood-${hoodId}`}
                        checked={profileData.preferredNeighborhoods.includes(hood)}
                        onCheckedChange={(checked) => handleCheckboxChange('preferredNeighborhoods', hood, checked as boolean)}
                        className="border-cyan-300 dark:border-cyan-600"
                      />
                      <Label htmlFor={hoodId} className="font-normal cursor-pointer text-slate-700 dark:text-slate-300">{hood}</Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="stayDuration" className="text-slate-700 dark:text-slate-300">
                {t('housing.guest_onboarding.stay_duration', 'Typical Stay Duration')}
              </Label>
              <Select
                value={profileData.stayDurationPreference}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, stayDurationPreference: value }))}
              >
                <SelectTrigger className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800" data-testid="select-stay-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short" data-testid="option-duration-short">
                    {t('housing.guest_onboarding.duration_short', 'Few days (1-7 days)')}
                  </SelectItem>
                  <SelectItem value="medium" data-testid="option-duration-medium">
                    {t('housing.guest_onboarding.duration_medium', 'Few weeks (1-4 weeks)')}
                  </SelectItem>
                  <SelectItem value="long" data-testid="option-duration-long">
                    {t('housing.guest_onboarding.duration_long', 'Month or more (1-3 months)')}
                  </SelectItem>
                  <SelectItem value="extended" data-testid="option-duration-extended">
                    {t('housing.guest_onboarding.duration_extended', 'Extended stay (3+ months)')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6" data-testid="guest-onboarding-budget">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white" data-testid="step-title-budget">
                {t('housing.guest_onboarding.budget_title', 'Budget Range')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400" data-testid="step-description-budget">
                {t('housing.guest_onboarding.budget_description', 'Help us find options within your budget')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.currency', 'Currency')}
                </Label>
                <Select
                  value={profileData.budgetRange.currency}
                  onValueChange={(value) => setProfileData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, currency: value }
                  }))}
                >
                  <SelectTrigger className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD" data-testid="option-currency-USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR" data-testid="option-currency-EUR">EUR - Euro</SelectItem>
                    <SelectItem value="ARS" data-testid="option-currency-ARS">ARS - Argentine Peso</SelectItem>
                    <SelectItem value="GBP" data-testid="option-currency-GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minBudget" className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.min_budget', 'Minimum Budget (per night)')}
                </Label>
                <Input
                  id="minBudget"
                  data-testid="input-min-budget"
                  type="number"
                  placeholder="0"
                  value={profileData.budgetRange.min || ''}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
                />
              </div>

              <div>
                <Label htmlFor="maxBudget" className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.max_budget', 'Maximum Budget (per night)')}
                </Label>
                <Input
                  id="maxBudget"
                  data-testid="input-max-budget"
                  type="number"
                  placeholder="0"
                  value={profileData.budgetRange.max || ''}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 0 }
                  }))}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6" data-testid="guest-onboarding-emergency">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white" data-testid="step-title-emergency">
                {t('housing.guest_onboarding.emergency_title', 'Emergency Contact')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400" data-testid="step-description-emergency">
                {t('housing.guest_onboarding.emergency_description', 'For your safety, please provide an emergency contact')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactName" className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.contact_name', 'Contact Name')}
                </Label>
                <Input
                  id="contactName"
                  data-testid="input-emergency-name"
                  placeholder={t('housing.guest_onboarding.contact_name_placeholder', 'Full name')}
                  value={profileData.emergencyContact.name}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone" className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.contact_phone', 'Contact Phone')}
                </Label>
                <Input
                  id="contactPhone"
                  data-testid="input-emergency-phone"
                  placeholder={t('housing.guest_onboarding.contact_phone_placeholder', '+1 234 567 8900')}
                  value={profileData.emergencyContact.phone}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
                />
              </div>

              <div>
                <Label htmlFor="contactRelationship" className="text-slate-700 dark:text-slate-300">
                  {t('housing.guest_onboarding.contact_relationship', 'Relationship')}
                </Label>
                <Input
                  id="contactRelationship"
                  data-testid="input-emergency-relationship"
                  placeholder={t('housing.guest_onboarding.contact_relationship_placeholder', 'E.g., Spouse, Parent, Friend')}
                  value={profileData.emergencyContact.relationship}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
                />
              </div>
            </div>

            <GlassCard depth={1} className="p-4 border-cyan-200/30 dark:border-cyan-500/30" data-testid="privacy-notice-emergency">
              <p className="text-sm text-cyan-800 dark:text-cyan-200">
                <strong>{t('housing.guest_onboarding.privacy_note', 'Privacy Note:')}</strong>{' '}
                {t('housing.guest_onboarding.privacy_text', 'This information is kept strictly confidential and will only be used in case of emergency.')}
              </p>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8" data-testid="guest-onboarding-container">
      <div className="container mx-auto px-4 max-w-4xl">
        <FadeIn>
          <GlassCard depth={2} className="mb-6 border-cyan-200/30 dark:border-cyan-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                    {t('housing.guest_onboarding.title', 'Complete Your Guest Profile')}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.guest_onboarding.step_progress', {
                      defaultValue: 'Step {{current}} of {{total}}',
                      current: currentStep,
                      total: totalSteps
                    })}
                  </span>
                  <MagneticButton
                    onClick={() => setLocation('/housing')}
                    strength={0.15}
                    className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-4 py-2 text-slate-700 dark:text-slate-300"
                    data-testid="button-exit-onboarding"
                  >
                    <X className="w-4 h-4" />
                  </MagneticButton>
                </div>
              </div>
              
              <ScaleIn delay={0.1}>
                <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    data-testid="progress-bar"
                    aria-valuenow={(currentStep / totalSteps) * 100}
                    aria-label={`Step ${currentStep} of ${totalSteps}`}
                    role="progressbar"
                  />
                </div>
              </ScaleIn>
            </div>
          </GlassCard>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-6 gap-3 mb-6" staggerDelay={0.05}>
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;
            
            return (
              <MagneticButton
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                strength={0.2}
                className={`
                  glass-card glass-depth-1 p-4 flex flex-col items-center gap-2 transition-all duration-300
                  ${isCompleted ? 'border-cyan-400/50 dark:border-cyan-500/50 bg-gradient-to-br from-cyan-100/50 to-teal-100/50 dark:from-cyan-900/30 dark:to-teal-900/30' : ''}
                  ${isCurrent ? 'border-teal-400/50 dark:border-teal-500/50 bg-gradient-to-br from-teal-100/50 to-blue-100/50 dark:from-teal-900/30 dark:to-blue-900/30 ring-2 ring-teal-400/30' : ''}
                  ${!isCompleted && !isCurrent ? 'border-slate-200/30 dark:border-slate-600/30' : ''}
                `}
                data-testid={`step-indicator-${step.id}`}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-gradient-to-br from-cyan-500 to-teal-500' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-teal-500 to-blue-500' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-200 dark:bg-slate-700' : ''}
                `}>
                  <StepIcon className={`w-5 h-5 ${isCompleted || isCurrent ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                </div>
                <span className={`
                  text-xs font-medium text-center transition-all duration-300
                  ${isCompleted ? 'text-cyan-700 dark:text-cyan-300' : ''}
                  ${isCurrent ? 'text-teal-700 dark:text-teal-300' : ''}
                  ${!isCompleted && !isCurrent ? 'text-slate-500 dark:text-slate-400' : ''}
                `}>
                  {step.label}
                </span>
              </MagneticButton>
            );
          })}
        </StaggerContainer>

        <ScaleIn delay={0.2}>
          <GlassCard depth={3} className="p-8 border-cyan-200/30 dark:border-cyan-500/30">
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-cyan-200/20 dark:border-cyan-800/20">
              {currentStep > 1 ? (
                <MagneticButton
                  onClick={handlePrevious}
                  strength={0.2}
                  className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-6 py-2.5 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  data-testid={`button-back-${currentStep === 1 ? 'accommodation' : currentStep === 2 ? 'dietary' : currentStep === 3 ? 'languages' : currentStep === 4 ? 'location' : currentStep === 5 ? 'budget' : 'emergency'}`}
                  aria-label="Go back to previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('housing.guest_onboarding.button_previous', 'Previous')}
                </MagneticButton>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <PulseButton 
                  onClick={handleNext}
                  className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-medium rounded-xl"
                  data-testid={`button-continue-${currentStep === 1 ? 'accommodation' : currentStep === 2 ? 'dietary' : currentStep === 3 ? 'languages' : currentStep === 4 ? 'location' : currentStep === 5 ? 'budget' : 'emergency'}`}
                  aria-label="Continue to next step"
                >
                  {t('housing.guest_onboarding.button_next', 'Next')}
                </PulseButton>
              ) : (
                <PulseButton 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-medium rounded-xl disabled:opacity-50"
                  data-testid="button-complete-onboarding"
                >
                  {isSubmitting 
                    ? t('housing.guest_onboarding.button_saving', 'Saving...') 
                    : t('housing.guest_onboarding.button_complete', 'Complete Profile')}
                </PulseButton>
              )}
            </div>
          </GlassCard>
        </ScaleIn>
      </div>
    </div>
  );
}
