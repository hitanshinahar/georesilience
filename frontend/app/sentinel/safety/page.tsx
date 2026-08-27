"use client";

import { ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentinelSafetyPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-500" /> Safety Guidance
        </h1>
        <p className="text-xs text-muted-foreground mt-1">What to do before, during, and after a landslide.</p>
      </div>

      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-orange-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Immediate Danger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p>If you suspect imminent danger, evacuate immediately. Do not wait for an official warning.</p>
          </div>
          <div className="flex gap-2">
            <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p>Move away from the path of a landslide or debris flow as quickly as possible.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" /> Before a Landslide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Learn about your local landslide risk.</li>
            <li>Watch for early warning signs: doors/windows sticking, new cracks in plaster/foundations, bulging fences/walls.</li>
            <li>Listen to local radio or TV for warnings of intense rainfall.</li>
            <li>Have an evacuation plan and emergency kit ready.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-background/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" /> During a Landslide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Listen for unusual sounds like trees cracking or boulders knocking together.</li>
            <li>If you are near a stream or channel, be alert for sudden increases or decreases in water flow.</li>
            <li>If escape is not possible, curl into a tight ball and protect your head.</li>
          </ul>
        </CardContent>
      </Card>
      
      <div className="text-center mt-8 text-xs text-muted-foreground/60 p-4">
        Disclaimer: This is prototype guidance. Always follow instructions from local emergency authorities.
      </div>
    </div>
  );
}
