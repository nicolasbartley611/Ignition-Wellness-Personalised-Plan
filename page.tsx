"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Download, Mail } from "lucide-react"

interface FormData {
  currentWeight: string
  goalWeight: string
  timeframe: string
  timeframeUnit: "weeks" | "months"
  age: string
  gender: "male" | "female" | "other"
  height: string
  heightUnit: "ft" | "cm"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active"
  fitnessGoals: string[]
  dietaryRestrictions: string[]
  workoutDays: string
  equipment: string[]
  experience: "beginner" | "intermediate" | "advanced"
  email: string
  phone: string
  name: string
}

interface FitnessPlans {
  fitnessPlan: {
    overview: string
    weeklySchedule: Array<{
      day: string
      workout: string
      exercises: string[]
      duration: string
    }>
  }
  dietPlan: {
    overview: string
    dailyCalories: number
    macros: {
      protein: number
      carbs: number
      fats: number
    }
    meals: Array<{
      meal: string
      foods: string[]
      calories: number
    }>
  }
  groceryList: {
    proteins: string[]
    carbs: string[]
    fats: string[]
    vegetables: string[]
    fruits: string[]
    other: string[]
  }
}

const steps = ["Basic Info", "Physical Stats", "Goals & Preferences", "Workout Details", "Contact Info", "Your Plan"]

export default function FitnessLeadMagnet() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    currentWeight: "",
    goalWeight: "",
    timeframe: "",
    timeframeUnit: "weeks",
    age: "",
    gender: "male",
    height: "",
    heightUnit: "ft",
    activityLevel: "moderate",
    fitnessGoals: [],
    dietaryRestrictions: [],
    workoutDays: "",
    equipment: [],
    experience: "beginner",
    email: "",
    phone: "",
    name: "",
  })
  const [generatedPlans, setGeneratedPlans] = useState<FitnessPlans | null>(null)

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    const currentArray = formData[field] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateFormData(field, newArray)
  }

  const generatePlans = (): FitnessPlans => {
    const currentWeight = Number.parseFloat(formData.currentWeight)
    const goalWeight = Number.parseFloat(formData.goalWeight)
    const age = Number.parseInt(formData.age)
    const timeframeWeeks =
      formData.timeframeUnit === "months"
        ? Number.parseInt(formData.timeframe) * 4
        : Number.parseInt(formData.timeframe)

    // Calculate BMR and daily calories
    const heightInCm =
      formData.heightUnit === "ft" ? Number.parseFloat(formData.height) * 30.48 : Number.parseFloat(formData.height)

    const bmr =
      formData.gender === "male"
        ? 88.362 + 13.397 * currentWeight * 0.453592 + 4.799 * heightInCm - 5.677 * age
        : 447.593 + 9.247 * currentWeight * 0.453592 + 3.098 * heightInCm - 4.33 * age

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    }

    const dailyCalories = Math.round(bmr * activityMultipliers[formData.activityLevel])
    const weightDifference = goalWeight - currentWeight
    const isWeightLoss = weightDifference < 0

    // Adjust calories for goal
    const adjustedCalories = isWeightLoss ? dailyCalories - 500 : dailyCalories + 300

    // Generate workout plan based on goals and experience
    const workoutSchedule = generateWorkoutSchedule()
    const dietPlan = generateDietPlan(adjustedCalories)
    const groceryList = generateGroceryList()

    return {
      fitnessPlan: {
        overview: `Your personalized ${timeframeWeeks}-week fitness plan designed to help you ${isWeightLoss ? "lose" : "gain"} ${Math.abs(weightDifference)} lbs. This plan is tailored for your ${formData.experience} fitness level and ${formData.activityLevel} lifestyle.`,
        weeklySchedule: workoutSchedule,
      },
      dietPlan: {
        overview: `Your nutrition plan provides ${adjustedCalories} calories daily to support your ${isWeightLoss ? "weight loss" : "weight gain"} goals while maintaining muscle mass.`,
        dailyCalories: adjustedCalories,
        macros: {
          protein: Math.round((adjustedCalories * 0.3) / 4),
          carbs: Math.round((adjustedCalories * 0.4) / 4),
          fats: Math.round((adjustedCalories * 0.3) / 9),
        },
        meals: [
          {
            meal: "Breakfast",
            foods: ["Oatmeal with berries", "Greek yogurt", "Almonds"],
            calories: Math.round(adjustedCalories * 0.25),
          },
          {
            meal: "Lunch",
            foods: ["Grilled chicken breast", "Quinoa", "Mixed vegetables"],
            calories: Math.round(adjustedCalories * 0.35),
          },
          {
            meal: "Dinner",
            foods: ["Salmon fillet", "Sweet potato", "Broccoli"],
            calories: Math.round(adjustedCalories * 0.3),
          },
          {
            meal: "Snacks",
            foods: ["Apple with peanut butter", "Protein shake"],
            calories: Math.round(adjustedCalories * 0.1),
          },
        ],
      },
      groceryList,
    }
  }

  const generateWorkoutSchedule = () => {
    const workoutDays = Number.parseInt(formData.workoutDays)
    const hasGym = formData.equipment.includes("gym-access")
    const hasWeights = formData.equipment.includes("dumbbells") || formData.equipment.includes("barbells")

    const schedules = {
      3: [
        {
          day: "Monday",
          workout: "Upper Body Strength",
          exercises: hasWeights
            ? ["Push-ups", "Dumbbell rows", "Shoulder press", "Bicep curls"]
            : ["Push-ups", "Pike push-ups", "Tricep dips", "Plank"],
          duration: "45 minutes",
        },
        {
          day: "Wednesday",
          workout: "Lower Body & Core",
          exercises: ["Squats", "Lunges", "Glute bridges", "Plank variations"],
          duration: "45 minutes",
        },
        {
          day: "Friday",
          workout: "Full Body Circuit",
          exercises: ["Burpees", "Mountain climbers", "Jump squats", "Push-ups"],
          duration: "40 minutes",
        },
      ],
      4: [
        {
          day: "Monday",
          workout: "Upper Body Push",
          exercises: hasWeights
            ? ["Bench press", "Shoulder press", "Tricep extensions", "Push-ups"]
            : ["Push-ups", "Pike push-ups", "Tricep dips", "Handstand practice"],
          duration: "50 minutes",
        },
        {
          day: "Tuesday",
          workout: "Lower Body",
          exercises: ["Squats", "Deadlifts", "Lunges", "Calf raises"],
          duration: "50 minutes",
        },
        {
          day: "Thursday",
          workout: "Upper Body Pull",
          exercises: hasWeights
            ? ["Pull-ups", "Rows", "Bicep curls", "Face pulls"]
            : ["Pull-ups", "Inverted rows", "Superman", "Reverse flies"],
          duration: "50 minutes",
        },
        {
          day: "Saturday",
          workout: "Core & Conditioning",
          exercises: ["Plank variations", "Russian twists", "Bicycle crunches", "HIIT cardio"],
          duration: "40 minutes",
        },
      ],
      5: [
        {
          day: "Monday",
          workout: "Chest & Triceps",
          exercises: ["Bench press", "Incline press", "Tricep dips", "Push-ups"],
          duration: "60 minutes",
        },
        {
          day: "Tuesday",
          workout: "Back & Biceps",
          exercises: ["Pull-ups", "Rows", "Lat pulldowns", "Bicep curls"],
          duration: "60 minutes",
        },
        {
          day: "Wednesday",
          workout: "Legs",
          exercises: ["Squats", "Deadlifts", "Leg press", "Calf raises"],
          duration: "60 minutes",
        },
        {
          day: "Thursday",
          workout: "Shoulders & Abs",
          exercises: ["Shoulder press", "Lateral raises", "Plank", "Russian twists"],
          duration: "50 minutes",
        },
        {
          day: "Friday",
          workout: "Full Body Circuit",
          exercises: ["Burpees", "Thrusters", "Mountain climbers", "Jump squats"],
          duration: "45 minutes",
        },
      ],
    }

    return schedules[workoutDays as keyof typeof schedules] || schedules[3]
  }

  const generateDietPlan = (calories: number) => {
    return {
      overview: `Balanced nutrition plan with ${calories} daily calories`,
      dailyCalories: calories,
      macros: {
        protein: Math.round((calories * 0.3) / 4),
        carbs: Math.round((calories * 0.4) / 4),
        fats: Math.round((calories * 0.3) / 9),
      },
      meals: [
        {
          meal: "Breakfast",
          foods: ["Steel-cut oats", "Greek yogurt", "Mixed berries", "Almonds"],
          calories: Math.round(calories * 0.25),
        },
        {
          meal: "Lunch",
          foods: ["Grilled chicken", "Quinoa", "Roasted vegetables", "Avocado"],
          calories: Math.round(calories * 0.35),
        },
        {
          meal: "Dinner",
          foods: ["Baked salmon", "Sweet potato", "Steamed broccoli", "Olive oil"],
          calories: Math.round(calories * 0.3),
        },
        {
          meal: "Snacks",
          foods: ["Apple with almond butter", "Protein smoothie"],
          calories: Math.round(calories * 0.1),
        },
      ],
    }
  }

  const generateGroceryList = () => {
    return {
      proteins: [
        "Chicken breast (2 lbs)",
        "Salmon fillets (1 lb)",
        "Greek yogurt (32 oz)",
        "Eggs (1 dozen)",
        "Protein powder (1 container)",
        "Almonds (1 lb)",
        "Almond butter (1 jar)",
      ],
      carbs: [
        "Steel-cut oats (1 container)",
        "Quinoa (2 lbs)",
        "Sweet potatoes (3 lbs)",
        "Brown rice (2 lbs)",
        "Whole grain bread (1 loaf)",
      ],
      fats: ["Avocados (4 pieces)", "Olive oil (1 bottle)", "Coconut oil (1 jar)", "Mixed nuts (1 lb)"],
      vegetables: [
        "Broccoli (2 heads)",
        "Spinach (1 bag)",
        "Bell peppers (4 pieces)",
        "Carrots (2 lbs)",
        "Zucchini (3 pieces)",
        "Onions (2 lbs)",
      ],
      fruits: ["Mixed berries (2 containers)", "Bananas (6 pieces)", "Apples (6 pieces)", "Oranges (4 pieces)"],
      other: ["Coconut milk (2 cans)", "Spices & herbs", "Lemon (4 pieces)", "Garlic (1 bulb)"],
    }
  }

  const nextStep = () => {
    if (currentStep === steps.length - 2) {
      // Generate plans before showing results
      const plans = generatePlans()
      setGeneratedPlans(plans)
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentWeight">Current Weight</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={formData.currentWeight}
                  onChange={(e) => updateFormData("currentWeight", e.target.value)}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="goalWeight">Goal Weight</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  value={formData.goalWeight}
                  onChange={(e) => updateFormData("goalWeight", e.target.value)}
                  placeholder="140"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={formData.timeframe}
                  onChange={(e) => updateFormData("timeframe", e.target.value)}
                  placeholder="12"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <RadioGroup
                  value={formData.timeframeUnit}
                  onValueChange={(value) => updateFormData("timeframeUnit", value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weeks" id="weeks" />
                    <Label htmlFor="weeks">Weeks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="months" id="months" />
                    <Label htmlFor="months">Months</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData("age", e.target.value)}
                placeholder="25"
              />
            </div>
          </div>
        )

      case 1: // Physical Stats
        return (
          <div className="space-y-6">
            <div>
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => updateFormData("gender", value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => updateFormData("height", e.target.value)}
                  placeholder="5.8"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <RadioGroup
                  value={formData.heightUnit}
                  onValueChange={(value) => updateFormData("heightUnit", value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ft" id="ft" />
                    <Label htmlFor="ft">Feet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cm" id="cm" />
                    <Label htmlFor="cm">CM</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div>
              <Label>Current Activity Level</Label>
              <RadioGroup
                value={formData.activityLevel}
                onValueChange={(value) => updateFormData("activityLevel", value)}
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentary (desk job, no exercise)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light (light exercise 1-3 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate (moderate exercise 3-5 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active (hard exercise 6-7 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-active" id="very-active" />
                  <Label htmlFor="very-active">Very Active (physical job + exercise)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2: // Goals & Preferences
        return (
          <div className="space-y-6">
            <div>
              <Label>Primary Fitness Goals (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["Weight Loss", "Muscle Gain", "Strength Building", "Endurance", "Flexibility", "General Health"].map(
                  (goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.fitnessGoals.includes(goal)}
                        onCheckedChange={() => handleArrayToggle("fitnessGoals", goal)}
                      />
                      <Label htmlFor={goal}>{goal}</Label>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div>
              <Label>Dietary Restrictions/Preferences (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["None", "Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Low-Carb"].map(
                  (diet) => (
                    <div key={diet} className="flex items-center space-x-2">
                      <Checkbox
                        id={diet}
                        checked={formData.dietaryRestrictions.includes(diet)}
                        onCheckedChange={() => handleArrayToggle("dietaryRestrictions", diet)}
                      />
                      <Label htmlFor={diet}>{diet}</Label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )

      case 3: // Workout Details
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="workoutDays">How many days per week can you workout?</Label>
              <RadioGroup
                value={formData.workoutDays}
                onValueChange={(value) => updateFormData("workoutDays", value)}
                className="flex gap-4 mt-2"
              >
                {["3", "4", "5", "6", "7"].map((days) => (
                  <div key={days} className="flex items-center space-x-2">
                    <RadioGroupItem value={days} id={`days-${days}`} />
                    <Label htmlFor={`days-${days}`}>{days} days</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Available Equipment (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "No Equipment",
                  "Dumbbells",
                  "Barbells",
                  "Resistance Bands",
                  "Gym Access",
                  "Pull-up Bar",
                  "Kettlebells",
                  "Cardio Equipment",
                ].map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={formData.equipment.includes(equipment.toLowerCase().replace(" ", "-"))}
                      onCheckedChange={() => handleArrayToggle("equipment", equipment.toLowerCase().replace(" ", "-"))}
                    />
                    <Label htmlFor={equipment}>{equipment}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Fitness Experience Level</Label>
              <RadioGroup
                value={formData.experience}
                onValueChange={(value) => updateFormData("experience", value)}
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner (0-6 months)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate (6 months - 2 years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced (2+ years)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 4: // Contact Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Almost Done! 🎉</h3>
              <p className="text-gray-600">Enter your contact info to receive your personalized fitness plan</p>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
                <br />• Get your personalized fitness & nutrition plan instantly
                <br />• Receive weekly tips and motivation via email
                <br />• Optional: Book a free 15-minute consultation call
              </p>
            </div>
          </div>
        )

      case 5: // Results
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Your Personalized Plan is Ready!</h2>
              <p className="text-gray-600">Here's your custom fitness and nutrition roadmap</p>
            </div>

            {generatedPlans && (
              <>
                {/* Fitness Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">💪 Your Fitness Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-700">{generatedPlans.fitnessPlan.overview}</p>
                    <div className="space-y-4">
                      {generatedPlans.fitnessPlan.weeklySchedule.map((day, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold">
                            {day.day} - {day.workout}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">Duration: {day.duration}</p>
                          <ul className="text-sm space-y-1">
                            {day.exercises.map((exercise, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {exercise}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Diet Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">🥗 Your Nutrition Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-700">{generatedPlans.dietPlan.overview}</p>
                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {generatedPlans.dietPlan.macros.protein}g
                        </div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{generatedPlans.dietPlan.macros.carbs}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{generatedPlans.dietPlan.macros.fats}g</div>
                        <div className="text-sm text-gray-600">Fats</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {generatedPlans.dietPlan.meals.map((meal, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold">
                            {meal.meal} ({meal.calories} cal)
                          </h4>
                          <ul className="text-sm space-y-1">
                            {meal.foods.map((food, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {food}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Grocery List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">🛒 Your Weekly Grocery List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {Object.entries(generatedPlans.groceryList).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-semibold capitalize mb-2 text-gray-800">
                            {category.replace(/([A-Z])/g, " $1").trim()}
                          </h4>
                          <ul className="space-y-1">
                            {items.map((item, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
                  <CardContent className="text-center p-6">
                    <h3 className="text-xl font-bold mb-2">Ready to Transform Your Life? 🚀</h3>
                    <p className="text-gray-700 mb-4">
                      This is just the beginning! Get personalized coaching, meal prep guides, and weekly check-ins.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Mail className="w-4 h-4 mr-2" />
                        Book Free Consultation
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF Plan
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">A copy of this plan has been sent to {formData.email}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.currentWeight && formData.goalWeight && formData.timeframe && formData.age
      case 1:
        return formData.height && formData.gender && formData.activityLevel
      case 2:
        return formData.fitnessGoals.length > 0
      case 3:
        return formData.workoutDays && formData.experience
      case 4:
        return formData.email
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Personalized Fitness Plan</h1>
          <p className="text-gray-600">Answer a few questions to receive a custom workout and nutrition plan</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {steps.map((step, index) => (
              <span key={index} className={index <= currentStep ? "text-blue-600 font-medium" : ""}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{steps[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>

          {/* Navigation */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-between p-6 pt-0">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed()} className="bg-blue-600 hover:bg-blue-700">
                {currentStep === steps.length - 2 ? "Generate My Plan" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🔒 Your information is secure and will never be shared</p>
        </div>
      </div>
    </div>
  )
}
