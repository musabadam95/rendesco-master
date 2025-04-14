import React, { useEffect, useMemo } from "react";
import { EnergyData } from "../../types/Energy.types";
import './GreenEnergyPercentage.css';
const GreenEnergyPercentage = () => {
    const [CurrentEnergyData, setCurrentEnergyData] = React.useState<EnergyData[]>([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('https://data.elexon.co.uk/bmrs/api/v1/generation/outturn/current');
            if (response.status === 200) {
                const data = await response.json();
                if (!data) {
                    console.log('Error fetching data', data);
                    setCurrentEnergyData([]);
                    return;
                }
                const dataTransactions: EnergyData[] = data;
                setCurrentEnergyData(dataTransactions);
            } else {
                console.log('Error fetching data', response.statusText);
                setCurrentEnergyData([]);
            }
        }
        fetchData()
    }, []);

    const currentGreenEnergyUsage = useMemo(() => {

        const energyCategory = [
            { name: "BIOMASS", rating: "G" },
            { name: "CCGT", rating: "NG" },
            { name: "COAL", rating: "NG" },
            { name: "INTELEC", rating: "N" },
            { name: "INTEW", rating: "N" },
            { name: "INTFR", rating: "N" },
            { name: "INTGRNL", rating: "N" },
            { name: "INTIFA2", rating: "N" },
            { name: "INTIRL", rating: "N" },
            { name: "INTNED", rating: "N" },
            { name: "INTNEM", rating: "N" },
            { name: "INTNSL", rating: "N" },
            { name: "INTVKL", rating: "N" },
            { name: "NPSHYD", rating: "G" },
            { name: "NUCLEAR", rating: "G" },
            { name: "OCGT", rating: "NG" },
            { name: "OIL", rating: "NG" },
            { name: "OTHER", rating: "N" },
            { name: "PS", rating: "G" },
            { name: "WIND", rating: "G" }
        ]

        const currEnergyGreenUsage = [
            { rating: "G", generation: 0 },
            { rating: "NG", generation: 0 },
            { rating: "N", generation: 0 }
        ];
        CurrentEnergyData.forEach((data) => {
            const category = energyCategory.find(cat => cat.name === data.fuelType);
            if (category) {
                const ratingIndex = currEnergyGreenUsage.findIndex(rating => rating.rating === category.rating);
                if (ratingIndex !== -1) {
                    currEnergyGreenUsage[ratingIndex].generation += data.currentUsage;
                }
            }
        });
        return currEnergyGreenUsage
    }, [CurrentEnergyData])


    const overallGreenPercentage = useMemo(() => {
        const totalGeneration = currentGreenEnergyUsage.reduce((acc, curr) => acc + curr.generation, 0);
        const greenGeneration = currentGreenEnergyUsage.find(rating => rating.rating === "G")?.generation || 0;
        return totalGeneration > 0 ? ((greenGeneration / totalGeneration) * 100) : 0;
    }, [currentGreenEnergyUsage])

    const percentageClass = useMemo(() => {
        if (overallGreenPercentage < 33) return "low";
        if (overallGreenPercentage < 50) return "medium";
        return "high";
    }, [overallGreenPercentage]);

    const overallMessage = useMemo(() => {
        if (percentageClass == "low") return "Let's strive to increase our use of clean energy for a sustainable future!";
        if (percentageClass == "medium") return "Not too bad but lets push for more clean energy"
        return "Doing great job lets keep going !!"
    }, [percentageClass])
    if (overallGreenPercentage) {
        return (
            <>
                <h1 className={`green-percentage ${percentageClass}`}>
                    The Grid is {overallGreenPercentage.toPrecision(2)}% green today
                </h1>
                <h1 className={`green-percentage ${percentageClass}`}>
                    {overallMessage}
                </h1>
            </>
        );
    }

};
export default GreenEnergyPercentage;