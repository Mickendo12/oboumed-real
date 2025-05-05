
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

interface DataConfigItem {
  id: string;
  [key: string]: any;
}

const DataConfig: React.FC = () => {
  const [configData, setConfigData] = useState<DataConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataConfig = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dataconfig"));
        const data: DataConfigItem[] = [];
        
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setConfigData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dataconfig:", err);
        setError("Une erreur s'est produite lors du chargement des données de configuration.");
        setLoading(false);
      }
    };

    fetchDataConfig();
  }, []);

  const renderDataItem = (item: DataConfigItem) => {
    return (
      <div key={item.id} className="mb-6 border-b pb-4 last:border-b-0 last:pb-0">
        <h3 className="text-lg font-medium mb-2">Document ID: {item.id}</h3>
        <div className="grid gap-2">
          {Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 gap-4">
              <div className="font-medium">{key}</div>
              <div className="col-span-2">
                {renderValue(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Non défini</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc pl-5 space-y-1">
            {value.map((item, index) => (
              <li key={index}>{renderValue(item)}</li>
            ))}
          </ul>
        );
      }
      
      return (
        <div className="bg-muted/50 p-2 rounded">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="grid grid-cols-3 gap-2 mb-1 last:mb-0">
              <div className="font-medium text-sm">{subKey}</div>
              <div className="col-span-2 text-sm">{renderValue(subValue)}</div>
            </div>
          ))}
        </div>
      );
    }
    
    return String(value);
  };

  return (
    <div className="min-h-screen bg-dot-pattern relative overflow-hidden py-10">
      <div className="container max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center mb-6 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
        
        <Card className="dark-container">
          <CardHeader>
            <CardTitle className="text-2xl">Configuration des Données</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : error ? (
              <div className="text-destructive p-4 text-center">
                {error}
              </div>
            ) : configData.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Aucune donnée de configuration trouvée.</p>
              </div>
            ) : (
              <>
                {configData.map(renderDataItem)}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataConfig;
