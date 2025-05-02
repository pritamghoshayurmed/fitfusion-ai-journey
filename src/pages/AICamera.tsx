
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AICamera = () => {
  const navigate = useNavigate();
  const { isProfileComplete } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSelectedImage(event.target.result);
          setResult(null);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Fake result (in a real app, this would come from the AI model)
      setResult({
        name: "Grilled Salmon Salad",
        calories: 320,
        protein: 28,
        carbs: 12,
        fat: 18
      });
      
      setIsAnalyzing(false);
      toast.success("Food analyzed successfully!");
    }, 2000);
  };

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Profile Required</h2>
          <p className="text-gray-600 mb-6">
            To use the AI Camera feature, please create your profile first.
          </p>
          <Button 
            onClick={() => navigate('/profile')}
            className="bg-fitfusion-purple hover:bg-purple-600"
          >
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Food Image Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                {selectedImage ? (
                  <div className="relative w-full">
                    <img 
                      src={selectedImage} 
                      alt="Food preview" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      className="absolute top-2 right-2 bg-white"
                      onClick={() => setSelectedImage(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">Upload Food Image</h3>
                      <p className="text-gray-500 text-sm">Take a photo or upload an existing one</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button 
                        disabled 
                        className="bg-fitfusion-purple hover:bg-purple-600"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                      <label>
                        <Button 
                          variant="outline" 
                          className="w-full cursor-pointer"
                          asChild
                        >
                          <div>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedImage && !result && (
                <Button 
                  className="w-full bg-fitfusion-purple hover:bg-purple-600"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>Analyze Food Image</>
                  )}
                </Button>
              )}
              
              <div className="text-center text-sm text-gray-500 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                This is a simulated feature. In a real implementation, it would use Gemini Pro Vision API.
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-medium">{result.name}</h3>
                  <p className="text-gray-500">Detected Food Item</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card">
                    <span className="text-sm text-gray-500">Calories</span>
                    <span className="text-2xl font-bold">{result.calories}</span>
                    <span className="text-xs text-gray-400">kcal</span>
                  </div>
                  
                  <div className="stat-card">
                    <span className="text-sm text-gray-500">Protein</span>
                    <span className="text-2xl font-bold">{result.protein}g</span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-fitfusion-purple h-1.5 rounded-full" style={{ width: `${(result.protein / 50) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <span className="text-sm text-gray-500">Carbs</span>
                    <span className="text-2xl font-bold">{result.carbs}g</span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-fitfusion-blue h-1.5 rounded-full" style={{ width: `${(result.carbs / 50) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <span className="text-sm text-gray-500">Fat</span>
                    <span className="text-2xl font-bold">{result.fat}g</span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-fitfusion-orange h-1.5 rounded-full" style={{ width: `${(result.fat / 50) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 mt-6 border-t">
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      toast.success("Food logged successfully");
                      setSelectedImage(null);
                      setResult(null);
                    }}
                  >
                    Add to Food Diary
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-gray-400 mb-2">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg">No Analysis Yet</p>
                </div>
                <p className="text-sm text-gray-500 max-w-md">
                  Upload a food image and analyze it to see nutritional information here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-gray-500">No recent scans</p>
              <p className="text-sm text-gray-400 mt-1">Your scanned foods will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICamera;
