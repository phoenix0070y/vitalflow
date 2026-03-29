import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import List "mo:core/List";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  public type UserRole = AccessControl.UserRole;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ENV variable for OpenAI API key (should be set in canister.yaml environment block)
  let openaiApiKey : Text = "env:OPENAI_API_KEY";
  let openaiUrl = "https://api.openai.com/v1/chat/completions";
  let maxResponseBytes : Nat64 = 4096;

  type Timestamp = Int;

  type MacroTargets = {
    protein_g : Float;
    carbs_g : Float;
    fat_g : Float;
  };

  type UserProfile = {
    name : Text;
    age : Nat;
    height_cm : Float;
    weight_kg : Float;
    goal : Text;
    dietary_restrictions : [Text];
    daily_calories : Nat;
    macro_targets : MacroTargets;
    last_active : Timestamp;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  public type FoodLogEntry = {
    food_name : Text;
    meal_type : Text;
    calories : Float;
    protein_g : Float;
    carbs_g : Float;
    fat_g : Float;
    date : Text;
  };

  public type MealTemplate = {
    name : Text;
    description : Text;
    image : ExternalBlob.ExternalBlob;
    calories : Float;
    protein_g : Float;
    carbs_g : Float;
    fat_g : Float;
    allergy_tags : [Text];
    category : Text;
  };

  module MealTemplate {
    public func compare(m1 : MealTemplate, m2 : MealTemplate) : Order.Order {
      Text.compare(m1.name, m2.name);
    };
  };

  public type WorkoutExercise = {
    name : Text;
    sets : Nat;
    reps : Nat;
    duration_seconds : Nat;
    muscle_group : Text;
    animation_type : Text;
  };

  public type WorkoutPlan = {
    name : Text;
    goal : Text;
    description : Text;
    difficulty : Text;
    duration_minutes : Nat;
    exercises : [WorkoutExercise];
  };

  module WorkoutPlan {
    public func compare(w1 : WorkoutPlan, w2 : WorkoutPlan) : Order.Order {
      Text.compare(w1.name, w2.name);
    };
  };

  public type WorkoutLog = {
    workout_plan_id : Nat;
    date : Text;
    duration_minutes : Nat;
    calories_burned : Float;
    completed : Bool;
  };

  public type WeightEntry = {
    date : Text;
    weight_kg : Float;
  };

  public type DailyTotals = {
    calories : Float;
    protein_g : Float;
    carbs_g : Float;
    fat_g : Float;
  };

  type FoodLog = {
    entries : List.List<FoodLogEntry>;
    dateIndex : Map.Map<Text, List.List<FoodLogEntry>>;
  };

  public type DailyFoodSummary = {
    entries : [FoodLogEntry];
    totals : DailyTotals;
  };

  type WorkoutLogList = {
    logs : List.List<WorkoutLog>;
    dateIndex : Map.Map<Text, List.List<WorkoutLog>>;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let foodLogs = Map.empty<Principal, FoodLog>();
  let mealTemplates = Map.empty<Nat, MealTemplate>();
  let workoutPlans = Map.empty<Nat, WorkoutPlan>();
  let workoutLogs = Map.empty<Principal, WorkoutLogList>();
  let userWeightEntries = Map.empty<Principal, List.List<WeightEntry>>();

  var nextMealId = 1;
  var nextWorkoutPlanId = 1;

  // Required frontend functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let now = Time.now();
    let newProfile = {
      profile with
      last_active = now;
      dietary_restrictions = profile.dietary_restrictions;
    };
    userProfiles.add(caller, newProfile);

    // Initialize user data structures if not exists
    if (not foodLogs.containsKey(caller)) {
      foodLogs.add(
        caller,
        {
          entries = List.empty<FoodLogEntry>();
          dateIndex = Map.empty<Text, List.List<FoodLogEntry>>();
        },
      );
    };
    if (not workoutLogs.containsKey(caller)) {
      workoutLogs.add(
        caller,
        {
          logs = List.empty<WorkoutLog>();
          dateIndex = Map.empty<Text, List.List<WorkoutLog>>();
        },
      );
    };
    if (not userWeightEntries.containsKey(caller)) {
      userWeightEntries.add(caller, List.empty<WeightEntry>());
    };
  };

  public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists") };

    let now = Time.now();
    let newProfile = {
      profile with
      last_active = now;
      dietary_restrictions = profile.dietary_restrictions;
    };
    userProfiles.add(caller, newProfile);
    foodLogs.add(
      caller,
      {
        entries = List.empty<FoodLogEntry>();
        dateIndex = Map.empty<Text, List.List<FoodLogEntry>>();
      },
    );
    workoutLogs.add(
      caller,
      {
        logs = List.empty<WorkoutLog>();
        dateIndex = Map.empty<Text, List.List<WorkoutLog>>();
      },
    );
    userWeightEntries.add(caller, List.empty<WeightEntry>());
  };

  public shared ({ caller }) func updateUser(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    if (not (userProfiles.containsKey(caller))) {
      Runtime.trap("User not found");
    };

    let now = Time.now();
    let updatedProfile = {
      profile with
      last_active = now;
      dietary_restrictions = profile.dietary_restrictions;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func logMeal(meal : FoodLogEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log meals");
    };
    let userFoodLog = switch (foodLogs.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?f) { f };
    };

    userFoodLog.entries.add(meal);

    let newEntries = switch (userFoodLog.dateIndex.get(meal.date)) {
      case (null) { List.singleton<FoodLogEntry>(meal) };
      case (?existing) {
        let mutableCopy = existing.clone();
        mutableCopy.add(meal);
        mutableCopy;
      };
    };
    userFoodLog.dateIndex.add(meal.date, newEntries);
    foodLogs.add(caller, userFoodLog);
  };

  public query ({ caller }) func getMealLogsByDate(date : Text) : async DailyFoodSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view meal logs");
    };
    let userFoodLogs = switch (foodLogs.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?f) { f };
    };

    let entries = switch (userFoodLogs.dateIndex.get(date)) {
      case (null) { List.empty<FoodLogEntry>() };
      case (?entries) { entries };
    };

    var calories = 0.0;
    var protein = 0.0;
    var carbs = 0.0;
    var fat = 0.0;

    let entriesArray = entries.toArray();
    for (entry in entriesArray.values()) {
      calories := calories + entry.calories;
      protein := protein + entry.protein_g;
      carbs := carbs + entry.carbs_g;
      fat := fat + entry.fat_g;
    };

    let totals = {
      calories;
      protein_g = protein;
      carbs_g = carbs;
      fat_g = fat;
    };

    {
      entries = entriesArray;
      totals;
    };
  };

  public shared ({ caller }) func addMealTemplate(meal : MealTemplate) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add meal templates");
    };
    let id = nextMealId;
    mealTemplates.add(id, meal);
    nextMealId += 1;
    id;
  };

  public shared ({ caller }) func updateMealTemplate(id : Nat, meal : MealTemplate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update meal templates");
    };
    if (not (mealTemplates.containsKey(id))) { Runtime.trap("Meal template not found") };
    mealTemplates.add(id, meal);
  };

  public shared ({ caller }) func deleteMealTemplate(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete meal templates");
    };
    if (not (mealTemplates.containsKey(id))) { Runtime.trap("Meal template not found") };
    mealTemplates.remove(id);
  };

  public query ({ caller }) func getMealTemplate(id : Nat) : async MealTemplate {
    switch (mealTemplates.get(id)) {
      case (null) { Runtime.trap("Meal template not found") };
      case (?meal) { meal };
    };
  };

  public query ({ caller }) func getAllMealTemplates() : async [MealTemplate] {
    mealTemplates.values().toArray().sort();
  };

  public query ({ caller }) func filterMealsByDietaryRestrictions(restrictions : [Text]) : async [MealTemplate] {
    let filteredMeals = List.empty<MealTemplate>();

    for (meal in mealTemplates.values()) {
      var hasRestriction = false;
      for (tag in meal.allergy_tags.values()) {
        for (restriction in restrictions.values()) {
          if (tag == restriction) {
            hasRestriction := true;
          };
        };
      };
      if (not hasRestriction) {
        filteredMeals.add(meal);
      };
    };

    filteredMeals.toArray();
  };

  public shared ({ caller }) func addWorkoutPlan(plan : WorkoutPlan) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add workout plans");
    };
    let id = nextWorkoutPlanId;
    workoutPlans.add(id, plan);
    nextWorkoutPlanId += 1;
    id;
  };

  public shared ({ caller }) func updateWorkoutPlan(id : Nat, plan : WorkoutPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update workout plans");
    };
    if (not (workoutPlans.containsKey(id))) { Runtime.trap("Workout plan not found") };
    workoutPlans.add(id, plan);
  };

  public query ({ caller }) func getWorkoutPlan(id : Nat) : async WorkoutPlan {
    switch (workoutPlans.get(id)) {
      case (null) { Runtime.trap("Workout plan not found") };
      case (?plan) { plan };
    };
  };

  public query ({ caller }) func getAllWorkoutPlans() : async [WorkoutPlan] {
    workoutPlans.values().toArray().sort();
  };

  public shared ({ caller }) func logWorkout(log : WorkoutLog) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workouts");
    };
    let userWorkoutLogList = switch (workoutLogs.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?list) { list };
    };

    userWorkoutLogList.logs.add(log);

    let newLogs = switch (userWorkoutLogList.dateIndex.get(log.date)) {
      case (null) { List.singleton<WorkoutLog>(log) };
      case (?existing) {
        let mutableCopy = existing.clone();
        mutableCopy.add(log);
        mutableCopy;
      };
    };
    userWorkoutLogList.dateIndex.add(log.date, newLogs);
    workoutLogs.add(caller, userWorkoutLogList);
  };

  public query ({ caller }) func getWorkoutsByDate(date : Text) : async [WorkoutLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout logs");
    };
    let userWorkoutLog = switch (workoutLogs.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?list) { list };
    };

    switch (userWorkoutLog.dateIndex.get(date)) {
      case (null) { [] };
      case (?entries) {
        let mutableCopy = entries.clone();
        mutableCopy.toArray();
      };
    };
  };

  public shared ({ caller }) func logWeight(entry : WeightEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log weight");
    };
    switch (userWeightEntries.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?list) { list.add(entry) };
    };
  };

  public query ({ caller }) func getWeightHistory() : async [WeightEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weight history");
    };
    let entries = switch (userWeightEntries.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?list) { list };
    };
    entries.toArray();
  };

  public query ({ caller }) func calculateBMI() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate BMI");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };
    let height_m = profile.height_cm / 100.0;
    profile.weight_kg / (height_m * height_m);
  };

  public query ({ caller }) func getProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    userProfiles.values().toArray().sort();
  };

  // Backend AI features

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getUserContext(caller : Principal) : Text {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        "Goal: " # profile.goal # "\n" #
        "Calorie Target: " # profile.daily_calories.toText() #
        " calories\nProtein: " # profile.macro_targets.protein_g.toText() # "g\n" #
        "Carbs: " # profile.macro_targets.carbs_g.toText() # "g\n" #
        "Fat: " # profile.macro_targets.fat_g.toText() # "g\n" #
        "Dietary Restrictions: " # profile.dietary_restrictions.values().join(", ");
      };
    };
  };

  public shared ({ caller }) func getAIMealSuggestions(todayCalories : Float, todayProtein : Float, todayCarbs : Float, todayFat : Float) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this feature");
    };

    let userContext = getUserContext(caller);

    let prompt = "User Profile:\n" # userContext # "\n\nToday's Nutrient Intake:\n" #
    "Calories: " # todayCalories.toText() # "\n" #
    "Protein: " # todayProtein.toText() # "\n" #
    "Carbs: " # todayCarbs.toText() # "\n" #
    "Fat: " # todayFat.toText() # "\n\n" #
    "Based on this information, suggest 3-5 healthy meals the user can eat to reach their daily nutrient targets. " #
    "Return the suggestions as a JSON array with fields for name, calories, protein_g, carbs_g, and fat_g for each meal. " #
    "Make sure to consider any dietary restrictions provided in the user profile. Do not include cheese. " #
    "Use clean, machine-parsable, correct JSON output ONLY.\n";

    let aiRequest = "{" #
    "\"model\": \"gpt-3.5-turbo\", " #
    "\"max_tokens\": 1500, " #
    "\"temperature\": 0.4, " #
    "\"messages\": [" #
    "{\"role\": \"system\", \"content\": \"Provide meal suggestions as requested. Use only JSON output based on the user's context.\"}, " #
    "{\"role\": \"user\", \"content\": " # prompt.toText() # "}" #
    "]}";

    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = "Bearer " # openaiApiKey },
      { name = "Content-Type"; value = "application/json" },
    ];

    await OutCall.httpPostRequest(openaiUrl, headers, aiRequest, transform);
  };

  public shared ({ caller }) func getAIWorkoutRecommendation(recentWorkoutSummary : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use this feature");
    };

    let userContext = getUserContext(caller);

    let prompt = "User Profile:\n" # userContext # "\n\nRecent Workout Summary:\n" #
    recentWorkoutSummary # "\n\n" #
    "Based on the user's goal and recent workout history, provide personalized workout recommendations. " #
    "Return suggestions as a bullet-point list. Do not include nutrition advice. " #
    "Make sure to consider the user's current fitness level and goals. " #
    "Output only plain text, no JSON.\n";

    let aiRequest = "{" #
    "\"model\": \"gpt-3.5-turbo\", " #
    "\"max_tokens\": 1500, " #
    "\"temperature\": 0.4, " #
    "\"messages\": [" #
    "{\"role\": \"system\", \"content\": \"Provide workout recommendations only. Use plain text output based on the user's context.\"}, " #
    "{\"role\": \"user\", \"content\": " # prompt.toText() # "}" #
    "]}";

    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = "Bearer " # openaiApiKey },
      { name = "Content-Type"; value = "application/json" },
    ];

    await OutCall.httpPostRequest(openaiUrl, headers, aiRequest, transform);
  };

  public shared ({ caller }) func chatWithNutritionAI(message : Text, conversationContext : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use the chatbot feature");
    };

    let userContext = getUserContext(caller);

    let aiRequest = "{" #
    "\"model\": \"gpt-3.5-turbo\", " #
    "\"max_tokens\": 1500, " #
    "\"temperature\": 0.4, " #
    "\"messages\": [" #
    "{\"role\": \"system\", \"content\": \"You are a nutritionist AI. Use the user's profile information as context for your answers. " #
    "Focus on giving clear, concise answers to questions about nutrition, diet, fitness, and meal planning. " #
    "Use plain text responses, not JSON. Limit use of emojis and conversational language.\"}, " #
    "{\"role\": \"user\", \"content\": " # (userContext # message # conversationContext).toText() # "}" #
    "]}";

    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = "Bearer " # openaiApiKey },
      { name = "Content-Type"; value = "application/json" },
    ];

    await OutCall.httpPostRequest(openaiUrl, headers, aiRequest, transform);
  };
};
