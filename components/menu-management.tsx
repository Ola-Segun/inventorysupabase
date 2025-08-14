"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Utensils, Package, ChefHat, DollarSign, Clock } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  description: string
  ingredients: string[]
  preparationTime: number
  image: string
  status: "active" | "seasonal" | "draft"
}

const menuItems: MenuItem[] = [
  {
    id: "MENU-001",
    name: "Classic Cheeseburger",
    category: "mains",
    price: 12.99,
    description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce on a brioche bun.",
    ingredients: ["Beef patty", "Cheddar cheese", "Lettuce", "Tomato", "Special sauce", "Brioche bun"],
    preparationTime: 15,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
  },
  {
    id: "MENU-002",
    name: "Caesar Salad",
    category: "starters",
    price: 8.99,
    description: "Crisp romaine lettuce with parmesan cheese, croutons, and Caesar dressing.",
    ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing"],
    preparationTime: 10,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
  },
  {
    id: "MENU-003",
    name: "Margherita Pizza",
    category: "mains",
    price: 14.99,
    description: "Classic pizza with tomato sauce, fresh mozzarella, and basil.",
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Basil", "Olive oil"],
    preparationTime: 20,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
  },
  {
    id: "MENU-004",
    name: "Chocolate Lava Cake",
    category: "desserts",
    price: 7.99,
    description: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream.",
    ingredients: ["Chocolate", "Flour", "Eggs", "Sugar", "Butter", "Vanilla ice cream"],
    preparationTime: 15,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
  },
  {
    id: "MENU-005",
    name: "Iced Tea",
    category: "beverages",
    price: 3.49,
    description: "Refreshing iced tea with lemon and mint.",
    ingredients: ["Tea", "Lemon", "Mint", "Sugar", "Ice"],
    preparationTime: 5,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
  },
  {
    id: "MENU-006",
    name: "Pumpkin Soup",
    category: "starters",
    price: 6.99,
    description: "Creamy pumpkin soup with nutmeg and croutons.",
    ingredients: ["Pumpkin", "Cream", "Vegetable stock", "Nutmeg", "Croutons"],
    preparationTime: 25,
    image: "/placeholder.svg?height=100&width=100",
    status: "seasonal",
  },
  {
    id: "MENU-007",
    name: "Spicy Chicken Wings",
    category: "starters",
    price: 10.99,
    description: "Crispy chicken wings tossed in spicy buffalo sauce, served with blue cheese dip.",
    ingredients: ["Chicken wings", "Buffalo sauce", "Blue cheese", "Celery", "Carrots"],
    preparationTime: 20,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
  },
  {
    id: "MENU-008",
    name: "Vegetable Stir Fry",
    category: "mains",
    price: 11.99,
    description: "Mixed vegetables stir-fried in a savory sauce, served with steamed rice.",
    ingredients: ["Broccoli", "Carrots", "Bell peppers", "Snap peas", "Soy sauce", "Rice"],
    preparationTime: 15,
    image: "/placeholder.svg?height=100&width=100",
    status: "draft",
  },
]

interface Ingredient {
  id: string
  name: string
  unit: string
  stockQuantity: number
  costPerUnit: number
}

const ingredients: Ingredient[] = [
  {
    id: "ING-001",
    name: "Beef patty",
    unit: "piece",
    stockQuantity: 50,
    costPerUnit: 2.5,
  },
  {
    id: "ING-002",
    name: "Cheddar cheese",
    unit: "slice",
    stockQuantity: 100,
    costPerUnit: 0.5,
  },
  {
    id: "ING-003",
    name: "Lettuce",
    unit: "head",
    stockQuantity: 20,
    costPerUnit: 1.25,
  },
  {
    id: "ING-004",
    name: "Tomato",
    unit: "piece",
    stockQuantity: 40,
    costPerUnit: 0.75,
  },
  {
    id: "ING-005",
    name: "Special sauce",
    unit: "oz",
    stockQuantity: 100,
    costPerUnit: 0.25,
  },
  {
    id: "ING-006",
    name: "Brioche bun",
    unit: "piece",
    stockQuantity: 60,
    costPerUnit: 1.0,
  },
]

export function MenuManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false)
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    category: "mains",
    price: 0,
    description: "",
    preparationTime: 0,
    ingredients: [] as string[],
  })
  const [selectedIngredient, setSelectedIngredient] = useState("")

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && item.category === activeTab
  })

  const handleAddMenuItem = () => {
    // In a real app, this would add the menu item to the database
    console.log("Adding menu item:", newMenuItem)
    setIsAddMenuItemOpen(false)
    setNewMenuItem({
      name: "",
      category: "mains",
      price: 0,
      description: "",
      preparationTime: 0,
      ingredients: [],
    })
  }

  const handleAddIngredient = () => {
    if (selectedIngredient && !newMenuItem.ingredients.includes(selectedIngredient)) {
      setNewMenuItem({
        ...newMenuItem,
        ingredients: [...newMenuItem.ingredients, selectedIngredient],
      })
      setSelectedIngredient("")
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setNewMenuItem({
      ...newMenuItem,
      ingredients: newMenuItem.ingredients.filter((ing) => ing !== ingredient),
    })
  }

  const getStatusBadge = (status: MenuItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "seasonal":
        return <Badge className="bg-amber-500">Seasonal</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage your restaurant's menu</CardDescription>
            </div>
            <Dialog open={isAddMenuItemOpen} onOpenChange={setIsAddMenuItemOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>Enter the menu item details below to add it to your menu.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={newMenuItem.name}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newMenuItem.category}
                        onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starters">Starters</SelectItem>
                          <SelectItem value="mains">Main Courses</SelectItem>
                          <SelectItem value="desserts">Desserts</SelectItem>
                          <SelectItem value="beverages">Beverages</SelectItem>
                          <SelectItem value="sides">Side Dishes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newMenuItem.price || ""}
                        onChange={(e) =>
                          setNewMenuItem({ ...newMenuItem, price: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                      <Input
                        id="prepTime"
                        type="number"
                        value={newMenuItem.preparationTime || ""}
                        onChange={(e) =>
                          setNewMenuItem({ ...newMenuItem, preparationTime: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMenuItem.description}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ingredients</Label>
                    <div className="flex gap-2">
                      <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ingredient) => (
                            <SelectItem key={ingredient.id} value={ingredient.name}>
                              {ingredient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={handleAddIngredient}>
                        Add
                      </Button>
                    </div>
                    {newMenuItem.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newMenuItem.ingredients.map((ingredient) => (
                          <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                            {ingredient}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveIngredient(ingredient)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMenuItemOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMenuItem}>Add Menu Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu items..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all" onValueChange={setActiveTab}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="starters">Starters</SelectItem>
                <SelectItem value="mains">Main Courses</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="sides">Side Dishes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {getStatusBadge(item.status)}
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{item.preparationTime} minutes</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMenuItem(item)}>
                    View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredMenuItems.length} of {menuItems.length} menu items
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {selectedMenuItem && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menu Item Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedMenuItem(null)}>
                Close
              </Button>
            </div>
            <CardDescription>Detailed information for {selectedMenuItem.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">
                  <Utensils className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="ingredients">
                  <Package className="mr-2 h-4 w-4" />
                  Ingredients
                </TabsTrigger>
                <TabsTrigger value="recipe">
                  <ChefHat className="mr-2 h-4 w-4" />
                  Recipe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={selectedMenuItem.image || "/placeholder.svg"}
                      alt={selectedMenuItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="text-muted-foreground">{selectedMenuItem.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Category</h4>
                        <p className="text-muted-foreground capitalize">{selectedMenuItem.category}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Status</h4>
                        <div className="mt-1">{getStatusBadge(selectedMenuItem.status)}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Price</h4>
                        <p className="text-muted-foreground">${selectedMenuItem.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Preparation Time</h4>
                        <p className="text-muted-foreground">{selectedMenuItem.preparationTime} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Item
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Stock Quantity</TableHead>
                      <TableHead className="text-right">Cost per Unit</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMenuItem.ingredients.map((ingredientName) => {
                      const ingredientData = ingredients.find((i) => i.name === ingredientName)
                      return ingredientData ? (
                        <TableRow key={ingredientData.id}>
                          <TableCell>{ingredientData.name}</TableCell>
                          <TableCell>{ingredientData.unit}</TableCell>
                          <TableCell className="text-right">{ingredientData.stockQuantity}</TableCell>
                          <TableCell className="text-right">${ingredientData.costPerUnit.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${ingredientData.costPerUnit.toFixed(2)}</TableCell>
                        </TableRow>
                      ) : null
                    })}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total Ingredient Cost:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        $
                        {selectedMenuItem.ingredients
                          .reduce((total, ingredientName) => {
                            const ingredientData = ingredients.find((i) => i.name === ingredientName)
                            return total + (ingredientData?.costPerUnit || 0)
                          }, 0)
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Profit Analysis</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selling Price:</span>
                        <span>${selectedMenuItem.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ingredient Cost:</span>
                        <span>
                          $
                          {selectedMenuItem.ingredients
                            .reduce((total, ingredientName) => {
                              const ingredientData = ingredients.find((i) => i.name === ingredientName)
                              return total + (ingredientData?.costPerUnit || 0)
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Labor Cost (est.):</span>
                        <span>$2.50</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Profit Margin:</span>
                        <span className="text-green-600">
                          $
                          {(
                            selectedMenuItem.price -
                            selectedMenuItem.ingredients.reduce((total, ingredientName) => {
                              const ingredientData = ingredients.find((i) => i.name === ingredientName)
                              return total + (ingredientData?.costPerUnit || 0)
                            }, 0) -
                            2.5
                          ).toFixed(2)}{" "}
                          (
                          {Math.round(
                            ((selectedMenuItem.price -
                              selectedMenuItem.ingredients.reduce((total, ingredientName) => {
                                const ingredientData = ingredients.find((i) => i.name === ingredientName)
                                return total + (ingredientData?.costPerUnit || 0)
                              }, 0) -
                              2.5) /
                              selectedMenuItem.price) *
                              100,
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="recipe" className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Preparation Instructions</h3>
                    <Textarea
                      className="min-h-[200px]"
                      placeholder="Enter preparation instructions..."
                      defaultValue="1. Prepare all ingredients according to the list.
2. Heat the grill to medium-high heat.
3. Season the beef patty with salt and pepper.
4. Grill the patty for 4-5 minutes per side for medium doneness.
5. Add the cheddar cheese on top of the patty during the last minute of cooking.
6. Toast the brioche bun lightly.
7. Spread special sauce on the bottom bun.
8. Layer with lettuce, tomato, and the cooked patty with cheese.
9. Top with the other half of the bun and serve immediately."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Plating Instructions</h3>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Enter plating instructions..."
                      defaultValue="1. Place the assembled burger in the center of a warm plate.
2. Add a small ramekin of extra special sauce on the side.
3. Garnish with a pickle spear and a small portion of french fries.
4. Sprinkle the fries with a pinch of sea salt before serving."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Allergen Information</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Gluten</Badge>
                      <Badge>Dairy</Badge>
                      <Badge>Eggs</Badge>
                      <Badge variant="outline">Soy</Badge>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Recipe</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

