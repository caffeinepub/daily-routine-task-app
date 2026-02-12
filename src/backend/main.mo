import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";


actor {
  type TaskId = Nat;
  type UserId = Principal;

  // Task type definition
  type Task = {
    id : TaskId;
    title : Text;
    description : Text;
    reminderTime : ?Int; // Time in nanoseconds since epoch
    completed : Bool;
    procrastinated : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      switch (task1.id < task2.id, task1.id > task2.id) {
        case (true, false) { #less };
        case (false, true) { #greater };
        case (false, false) { Text.compare(task1.title, task2.title) };
      };
    };
  };

  // Streak type definition
  type Streak = {
    taskId : TaskId;
    currentStreak : Nat;
    bestStreak : Nat;
    lastUpdated : Time.Time;
  };

  module Streak {
    public func compare(streak1 : Streak, streak2 : Streak) : Order.Order {
      switch (streak1.taskId < streak2.taskId, streak1.taskId > streak2.taskId) {
        case (true, false) { #less };
        case (false, true) { #greater };
        case (false, false) {
          switch (streak1.currentStreak < streak2.currentStreak, streak1.currentStreak > streak2.currentStreak) {
            case (true, false) { #less };
            case (false, true) { #greater };
            case (false, false) { #equal };
          };
        };
      };
    };
  };

  // User preferences type
  type UserPreferences = {
    autoReset : Bool;
    notificationsEnabled : Bool;
  };

  // Singleton state for access control (by reference, not value).
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // In-memory task store for all users
  let userTasks = Map.empty<UserId, List.List<Task>>();
  let userStreaks = Map.empty<UserId, List.List<Streak>>();
  let userPreferences = Map.empty<UserId, UserPreferences>();

  // Initialize empty state for a user if it doesn't exist
  func initializeUserState(user : UserId) {
    if (not userTasks.containsKey(user)) {
      userTasks.add(user, List.empty<Task>());
    };

    if (not userStreaks.containsKey(user)) {
      userStreaks.add(user, List.empty<Streak>());
    };

    if (not userPreferences.containsKey(user)) {
      userPreferences.add(
        user,
        {
          autoReset = true;
          notificationsEnabled = true;
        },
      );
    };
  };

  // Task CRUD operations
  public shared ({ caller }) func createTask(title : Text, description : Text, reminderTime : ?Int) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    initializeUserState(caller);
    let currentTime = Time.now();

    let userTaskList = switch (userTasks.get(caller)) {
      case (null) { List.empty<Task>() };
      case (?tasks) { tasks };
    };

    let newTask : Task = {
      id = userTaskList.size();
      title;
      description;
      reminderTime;
      completed = false;
      procrastinated = false;
      createdAt = currentTime;
      updatedAt = currentTime;
    };

    userTaskList.add(newTask);
    userTasks.add(caller, userTaskList);

    newTask;
  };

  public shared ({ caller }) func updateTask(taskId : TaskId, title : Text, description : Text, reminderTime : ?Int) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let currentTime = Time.now();

    let userTaskList = switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) { tasks };
    };

    let updatedTaskList = userTaskList.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          {
            id = task.id;
            title;
            description;
            reminderTime;
            completed = task.completed;
            procrastinated = task.procrastinated;
            createdAt = task.createdAt;
            updatedAt = currentTime;
          };
        } else {
          task;
        };
      }
    );

    userTasks.add(caller, updatedTaskList);
    switch (updatedTaskList.find(func(task) { task.id == taskId })) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let userTaskList = switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) { tasks };
    };

    let updatedTaskList = userTaskList.filter(
      func(task) { task.id != taskId }
    );

    userTasks.add(caller, updatedTaskList);
  };

  public shared ({ caller }) func completeTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };
    let currentTime = Time.now();

    let userTaskList = switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) { tasks };
    };

    let updatedTaskList = userTaskList.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          {
            id = task.id;
            title = task.title;
            description = task.description;
            reminderTime = task.reminderTime;
            completed = true;
            procrastinated = task.procrastinated;
            createdAt = task.createdAt;
            updatedAt = currentTime;
          };
        } else {
          task;
        };
      }
    );

    userTasks.add(caller, updatedTaskList);
  };

  public shared ({ caller }) func toggleProcrastination(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle procrastination");
    };
    let currentTime = Time.now();

    let userTaskList = switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) { tasks };
    };

    let updatedTaskList = userTaskList.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          {
            id = task.id;
            title = task.title;
            description = task.description;
            reminderTime = task.reminderTime;
            completed = task.completed;
            procrastinated = not task.procrastinated;
            createdAt = task.createdAt;
            updatedAt = currentTime;
          };
        } else {
          task;
        };
      }
    );

    userTasks.add(caller, updatedTaskList);
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get all tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?tasks) { tasks.toArray().sort() };
    };
  };

  public shared ({ caller }) func setAutoReset(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set auto reset");
    };

    let currentPrefs = switch (userPreferences.get(caller)) {
      case (null) {
        {
          autoReset = enabled;
          notificationsEnabled = false;
        };
      };
      case (?prefs) {
        {
          autoReset = enabled;
          notificationsEnabled = prefs.notificationsEnabled;
        };
      };
    };

    userPreferences.add(caller, currentPrefs);
  };

  public query ({ caller }) func getAutoReset() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get auto reset");
    };

    switch (userPreferences.get(caller)) {
      case (null) { false };
      case (?prefs) { prefs.autoReset };
    };
  };

  public shared ({ caller }) func setNotificationsEnabled(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set notifications");
    };

    let currentPrefs = switch (userPreferences.get(caller)) {
      case (null) {
        {
          autoReset = false;
          notificationsEnabled = enabled;
        };
      };
      case (?prefs) {
        {
          autoReset = prefs.autoReset;
          notificationsEnabled = enabled;
        };
      };
    };

    userPreferences.add(caller, currentPrefs);
  };

  public query ({ caller }) func getNotificationsEnabled() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get notifications");
    };

    switch (userPreferences.get(caller)) {
      case (null) { false };
      case (?prefs) { prefs.notificationsEnabled };
    };
  };

  public shared ({ caller }) func getTasksForDay(_day : Int) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks for day");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?tasks) { tasks.toArray().sort() };
    };
  };

  // Profile
  public type UserProfile = {
    name : Text;
    // Other metadata if needed
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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
    userProfiles.add(caller, profile);
  };
};
