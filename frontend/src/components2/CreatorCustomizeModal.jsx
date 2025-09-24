import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components2/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components2/ui/tabs';
import { Button } from '@/components2/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components2/ui/radio-group';
import { Label } from '@/components2/ui/label';
import { Input } from '@/components2/ui/input';
import { toast } from '@/components2/ui/use-toast';
import { ScrollArea } from '@/components2/ui/scroll-area';
import { updateStyle } from '@/services/auth';


const themes = {   // Change to templates - 1-2-3 - with 2 color pallete selectable
  'theme-1': 'Tech & Clean (Indigo)',
  'theme-2': 'Bright & Uplifting',
  'theme-3': 'Dark & Premium'
};

const presetBanners = [ 
    'https://res.cloudinary.com/dyeomcmin/image/upload/v1750178706/fudzsgpiisuu50z9uq6h.png',
    'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688147/bg1-new_cwe7oi.png',
    'https://res.cloudinary.com/dyeomcmin/image/upload/v1740689969/Colourful_geometric_shapes_background_zsgrkc.png',
    'https://res.cloudinary.com/dyeomcmin/image/upload/v1740688147/2_ciw0y5.png',
  ];
  

export default function CreatorCustomizeModal({ open, onClose, onConfirm }) {
  const [selectedTheme, setSelectedTheme] = useState('theme-1');
  const [selectedBanner, setSelectedBanner] = useState(presetBanners[0]);
  const [customBanner, setCustomBanner] = useState('');

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedBanner(url);
    setCustomBanner(url);
    toast('Banner selected!', { description: 'Custom banner applied.' });
  };

  const handleConfirm = async () => {
    try {
      await updateStyle({ theme: selectedTheme, banner_url: selectedBanner });
      onConfirm({
        theme: themes[selectedTheme],
        banner: selectedBanner
      });
      toast('Saved',{  description: 'Your style is saved!' }); // ✅ CORRECTED
      onClose();
    } catch (err) {
      toast(
        'Error',
        {description: 'Could not save your style.',
        variant: 'destructive'
      });
      console.error(err);
    }
  };
  
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎨 Customize Your Creator Page</DialogTitle>
          <DialogDescription/>
        </DialogHeader>

        <Tabs defaultValue="theme">
          <TabsList className="mb-4">
            <TabsTrigger value="theme">Color Theme</TabsTrigger>
            <TabsTrigger value="banner">Banner</TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <RadioGroup
              value={selectedTheme}
              onValueChange={setSelectedTheme}
              className="space-y-3"
            >
              {Object.entries(themes).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key}>
                  <span
                    className={`inline-block w-3 h-3 mr-2 rounded-full ${
                      key === 'theme-1' ? 'bg-indigo-600' :
                      key === 'theme-2' ? 'bg-yellow-400' :
                      key === 'theme-3' ? 'bg-gray-800' : ''
                    }`}
                  />
                  {label}
                </Label>
              </div>
              
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="banner">
            <ScrollArea className="max-h-56 mb-4">
              <div className="grid grid-cols-2 gap-4">
                {presetBanners.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    onClick={() => setSelectedBanner(src)}
                    className={`w-full h-24 object-cover cursor-pointer rounded-lg border-4 ${
                      selectedBanner === src ? 'border-indigo-500' : 'border-transparent'
                    }`}
                    alt={`Banner ${idx + 1}`}
                  />
                ))}
              </div>
            </ScrollArea>

            <Label className="block mb-1">Or upload your own:</Label>
            <Input type="file" accept="image/*" onChange={handleBannerUpload} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Save & Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

