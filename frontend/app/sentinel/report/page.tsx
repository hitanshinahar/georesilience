"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Camera, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SentinelReportPage() {
  const router = useRouter();
  const [reportText, setReportText] = useState('');
  const [reporterType, setReporterType] = useState<'citizen' | 'field_officer'>('citizen');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    setIsLocating(true);
    setError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsLocating(false);
        },
        (_err) => {
          setError('Failed to get location. Please enter manually.');
          setIsLocating(false);
          // Default to Gangtok for demo if denied
          setLat(27.3389);
          setLng(88.6065);
        }
      );
    } else {
      setError('Geolocation not supported.');
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() || lat === '' || lng === '') {
      setError('Please provide report details and location.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitFieldReport({
        report_text: reportText,
        latitude: Number(lat),
        longitude: Number(lng),
        location_name: locationName || undefined,
        reporter_type: reporterType,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center gap-4 mt-20">
        <div className="bg-emerald-500/20 p-6 rounded-full border border-emerald-500/30">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mt-4">Report Submitted</h2>
        <p className="text-muted-foreground">
          Thank you. Your report has been sent to the Operations Command Center for AI analysis and review.
        </p>
        <Button 
          className="mt-8 w-full max-w-xs" 
          onClick={() => {
            setReportText('');
            setSubmitted(false);
            router.push('/sentinel');
          }}
        >
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Submit Field Report</h1>
        <p className="text-xs text-muted-foreground mt-1">Provide on-ground intelligence to the command center.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Location
            </Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] gap-1"
              onClick={handleGetLocation}
              disabled={isLocating}
            >
              {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
              Auto-Locate
            </Button>
          </div>
          
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-3 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Landmark / Area Name</Label>
                <Input 
                  placeholder="e.g. NH-10 near Sector 4" 
                  className="bg-background/50 h-9 text-sm"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Latitude</Label>
                  <Input 
                    type="number" step="any" 
                    placeholder="27.3389" 
                    className="bg-background/50 h-9 text-sm font-mono"
                    value={lat}
                    onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Longitude</Label>
                  <Input 
                    type="number" step="any" 
                    placeholder="88.6065" 
                    className="bg-background/50 h-9 text-sm font-mono"
                    value={lng}
                    onChange={(e) => setLng(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Report Details
          </Label>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">I am reporting as a:</Label>
            <Select value={reporterType} onValueChange={(v) => setReporterType((v as 'citizen' | 'field_officer') || 'citizen')}>
              <SelectTrigger className="w-full h-9 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizen">Citizen / Resident</SelectItem>
                <SelectItem value="field_officer">Authorized Field Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">What are you observing?</Label>
            <Textarea 
              placeholder="Describe what you see (e.g. 'Large cracks forming on the road, water seeping rapidly...')" 
              className="bg-background/50 min-h-[120px] text-sm"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
}
