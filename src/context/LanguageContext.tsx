import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "ar";

export const translations = {
  en: {
    // Navbar & Sidebar
    appName: "Playstation Hub",
    appSub: "Gaming & Coffee Net",
    jobs: "Dashboard",
    archiveTable: "Sessions History",
    profits: "Financials",
    adminMode: "Admin & Staff",
    profile: "Profile Settings",
    addPhoneType: "Add Device Type",
    logout: "Logout",
    toggleSidebar: "Toggle Sidebar",
    switchLanguage: "العربية",

    // Search & Filter
    searchPlaceholder: "Search customer, station, employee...",
    searchAnyField: "Search in all fields",
    advancedSearch: "Advanced Search (Dates)",
    dateInFrom: "From Start Time",
    dateInTo: "To Start Time",
    dateOutFrom: "From End Time",
    dateOutTo: "To End Time",
    resetAllFilters: "Reset Filters",
    todayIn: "Started Today",
    todayOut: "Ended Today",
    thisMonthIn: "This Month",
    underMaintenance: "Active Sessions",
    addJob: "Start New Session",
    printReport: "Print Receipt / Report",
    showingRecords: "Showing",
    records: "sessions",

    // Table Columns
    colId: "ID",
    colDateIn: "Start Time",
    colCustomerName: "Customer Name",
    colCustomerPhone: "Customer Phone",
    colDeviceType: "Station / Room",
    colVendor: "Device Model (PS5/PS4/PC)",
    colModel: "Booked Hours",
    colIssue: "Snacks & Drinks / Notes",
    colCost: "Total Price",
    colTechnician: "Staff Employee (Shift)",
    colDateOut: "End Time",
    colNotes: "Status & Extra Delay",
    colActions: "Actions",

    // Actions & Buttons
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    checkout: "End Session & Checkout",
    copy: "Copy",
    copied: "Copied!",

    // Dialogs
    deviceCheckIn: "🎮 Start Gaming Session",
    deviceCheckInDesc: "Enter customer details, select station and booked hours.",
    checkOutDetails: "🧾 End Session & Detailed Receipt",
    checkOutDetailsDesc: "Review total gaming hours, snacks ordered, delay penalties, and total bill.",
    editRecord: "✏️ Edit Session Details",
    editRecordDesc: "Update hours, assigned station, snacks or notes",
    addVendor: "🎮 Add Device / Station Model",
    addVendorDesc: "Manage Playstation, PC, and Gaming Room models",
    deleteConfirmTitle: "Confirm Delete Session",
    deleteConfirmDesc: "Are you sure you want to delete this gaming session record?",

    // Profits Page
    profitsTitle: "Profits & Coffee Net Financials",
    profitsSub: "Track 24-hour cycle revenue, employee sales contributions, and archived snapshots",
    todayProfit: "24h Current Cycle Profit",
    monthlyProfit: "Monthly Total Profit",
    allTimeProfit: "All-Time Historical Revenue",
    resetDailyProfit: "24h Shift Reset & Archive",
    profitHistory: "24-Hour Archived Cycle Summaries",
    resetConfirmTitle: "Confirm 24-Hour Cycle Reset",
    resetConfirmDesc: "This will archive current 24h revenue into historical records and reset the active daily counter.",

    // Admin Page
    adminTitle: "Admin & Employee Performance",
    adminSub: "Track employee shift performance, active staff sales leaderboard, and control permissions",
    addNewUser: "Add Employee Account",
    registeredUsers: "System Staff & Employees",
    userName: "Employee Name",
    emailAddress: "Email Address",
    role: "Role",
    createdAt: "Joined Date",
    adminRole: "Admin",
    userRole: "Staff / Employee",
    editUser: "Edit Employee",
    makeAdmin: "Make Admin",
    makeUser: "Remove Admin",
    confirmDeleteUser: "Confirm Delete Employee Account",

    // Profile Page
    profileTitle: "Profile Configuration",
    profileSub: "Manage your personal details, profile avatar color, and account password",
    accountSettings: "Account Settings & App Preferences",
    fullName: "Full Name",
    saveChanges: "Save Changes",
    appPreferences: "App Preferences",
    currency: "Currency",
    language: "Language",
    english: "English",
    arabic: "العربية (Arabic)",
    avatarColor: "Profile Avatar Color",
    avatarColorSub: "Select a theme color for your profile icon in the sidebar and top navbar",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordLeaveBlank: "Leave blank if you don't wish to change your password",
    administrator: "Administrator",
  },
  ar: {
    // Navbar & Sidebar
    appName: "بلايستيشن هب",
    appSub: "مركز ألعاب بلايستيشن وكافيه",
    jobs: "لوحة التحكم",
    archiveTable: "سجل الجلسات",
    profits: "الحسابات والأرباح",
    adminMode: "الموظفين والإدارة",
    profile: "إعدادات الحساب",
    addPhoneType: "إضافة فئة جهاز",
    logout: "تسجيل الخروج",
    toggleSidebar: "تبديل القائمة",
    switchLanguage: "English",

    // Search & Filter
    searchPlaceholder: "بحث باسم العميل، الجهاز، الموظف...",
    searchAnyField: "البحث في جميع البيانات",
    advancedSearch: "البحث المتقدم والتواريخ",
    dateInFrom: "من تاريخ البدء",
    dateInTo: "إلى تاريخ البدء",
    dateOutFrom: "من تاريخ الانتهاء",
    dateOutTo: "إلى تاريخ الانتهاء",
    resetAllFilters: "إعادة ضبط التصفية",
    todayIn: "بدأت اليوم",
    todayOut: "انتهت اليوم",
    thisMonthIn: "جلسات الشهر",
    underMaintenance: "الجلسات النشطة حالياً",
    addJob: "بدء جلسة جديدة",
    printReport: "طباعة التقرير / الفاتورة",
    showingRecords: "عرض",
    records: "جلسات",

    // Table Columns
    colId: "#",
    colDateIn: "وقت البدء",
    colCustomerName: "اسم العميل / اللاعب",
    colCustomerPhone: "رقم الهاتف",
    colDeviceType: "فئة الجهاز / الغرفة",
    colVendor: "اسم الجهاز / الغرفة",
    colModel: "عدد الساعات",
    colIssue: "الملاحظات والمشروبات",
    colCost: "المبلغ الإجمالي",
    colTechnician: "الموظف المسؤول",
    colDateOut: "وقت الانتهاء",
    colNotes: "ملاحظات المغادرة والطلبات المتبقية",
    colActions: "الإجراءات",

    // Actions & Buttons
    save: "حفظ البيانات",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    checkout: "إنهاء الجلسة والحساب",
    copy: "نسخ",
    copied: "تم النسخ!",

    // Dialogs
    deviceCheckIn: "🎮 بدء جلسة ألعاب جديدة",
    deviceCheckInDesc: "اختر الجهاز والموظف وساعات اللعب المحجوزة.",
    checkOutDetails: "🧾 إنهاء الجلسة والحساب النهائي",
    checkOutDetailsDesc: "مراجعة ساعات اللعب والطلب، تسجيل الملاحظات وتحديد وقت الانتهاء.",
    editRecord: "✏️ تعديل تفاصيل الجلسة",
    editRecordDesc: "تعديل وقت البدء والانتهاء، اسم العميل، والملاحظات",
    addVendor: "🎮 إضافة جهاز / غرفة جديدة",
    addVendorDesc: "إدارة غرف الفي أي بي وأجهزة البلايستيشن والكمبيوتر",
    deleteConfirmTitle: "تأكيد حذف الجلسة",
    deleteConfirmDesc: "هل أنت متأكد من حذف هذه الجلسة من السجل؟",

    // Profits Page
    profitsTitle: "الحسابات والأرباح",
    profitsSub: "متابعة أرباح الـ 24 ساعة، مبيعات الموظفين والشفتات، والسجلات المؤرشفة",
    todayProfit: "أرباح الشفت الحالي (24 ساعة)",
    monthlyProfit: "إجمالي أرباح الشهر",
    allTimeProfit: "إجمالي الأرباح الكلي",
    resetDailyProfit: "تصفير وأرشفة أرباح 24 ساعة",
    profitHistory: "سجل الدورات المؤرشفة",
    resetConfirmTitle: "تأكيد تصفير الدورة المالية",
    resetConfirmDesc: "سيتم نقل الأرباح الحالية إلى الأرشيف وتصفير العداد للـ 24 ساعة القادمة.",

    // Admin Page
    adminTitle: "الموظفين وتقييم الأداء",
    adminSub: "متابعة أداء الموظفين في الشفت ومبيعات كل موظف وصلاحيات النظام",
    addNewUser: "إضافة حساب موظف جديد",
    registeredUsers: "قائمة الموظفين والكاشير",
    userName: "اسم الموظف",
    emailAddress: "البريد الإلكتروني",
    role: "الصلاحية",
    createdAt: "تاريخ الإنشاء",
    adminRole: "مسؤول نظام",
    userRole: "موظف / كاشير",
    editUser: "تعديل الموظف",
    makeAdmin: "منح صلاحية أدمن",
    makeUser: "إلغاء صلاحية أدمن",
    confirmDeleteUser: "تأكيد حذف حساب الموظف",

    // Profile Page
    profileTitle: "إعدادات الحساب",
    profileSub: "تخصيص بياناتك الشخصية، لغة النظام، ولون الحساب",
    accountSettings: "إعدادات الحساب والتطبيقات",
    fullName: "الاسم بالكامل",
    saveChanges: "حفظ التغييرات",
    appPreferences: "تفضيلات النظام",
    currency: "العملة",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    avatarColor: "لون أيقونة الحساب",
    avatarColorSub: "اختر اللون المفضل لأيقونة حسابك في الشريط الجانبي والعلوي",
    changePassword: "تغيير كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    passwordLeaveBlank: "اتركه فارغاً إذا كنت لا تريد تغيير كلمة المرور",
    administrator: "مسؤول النظام",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const isRtl = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
