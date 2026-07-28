import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "ar";

export const translations = {
  en: {
    // Navbar & Sidebar
    appName: "Playstation Hub",
    appSub: "Gaming & Coffee Net",
    jobs: "Active Gaming Stations",
    archiveTable: "Sessions History & Records",
    profits: "Financials & Profits",
    adminMode: "Admin & Staff Performance",
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
    appSub: "كافيه نت وألعاب",
    jobs: "الجلسات والأجهزة النشطة",
    archiveTable: "سجل الأرشيف والبحث",
    profits: "الأرباح والمبيعات",
    adminMode: "أداء الموظفين والمسؤول",
    profile: "إعدادات الملف الشخصي",
    addPhoneType: "إضافة نوع جهاز",
    logout: "تسجيل الخروج",
    toggleSidebar: "تبديل القائمة الجانبية",
    switchLanguage: "English",

    // Search & Filter
    searchPlaceholder: "بحث برقم العميل، الأجهزة، أو الموظف...",
    searchAnyField: "البحث في جميع الحقول",
    advancedSearch: "البحث المتقدم (التواريخ)",
    dateInFrom: "من وقت البدء",
    dateInTo: "إلى وقت البدء",
    dateOutFrom: "من وقت الانتهاء",
    dateOutTo: "إلى وقت الانتهاء",
    resetAllFilters: "إعادة ضبط التصفية",
    todayIn: "بدأت اليوم",
    todayOut: "انتهت اليوم",
    thisMonthIn: "جلسات هذا الشهر",
    underMaintenance: "الجلسات النشطة",
    addJob: "بدء حجز / جلسة جديدة",
    printReport: "طباعة الفاتورة / التقرير",
    showingRecords: "عرض",
    records: "جلسة",

    // Table Columns
    colId: "م",
    colDateIn: "وقت البدء",
    colCustomerName: "اسم العميل",
    colCustomerPhone: "رقم الهاتف",
    colDeviceType: "الجهاز / الغرفة",
    colVendor: "نوع الجهاز (PS5/PS4/PC)",
    colModel: "الساعات المحددة",
    colIssue: "المشروبات والمأكولات / ملاحظات",
    colCost: "إجمالي المبلغ",
    colTechnician: "الموظف المسئول (الشفت)",
    colDateOut: "وقت الانتهاء",
    colNotes: "الحالة والغرامات الإضافية",
    colActions: "إجراءات",

    // Actions & Buttons
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    checkout: "إنهاء الجلسة والدفع",
    copy: "نسخ",
    copied: "تم النسخ!",

    // Dialogs
    deviceCheckIn: "🎮 بدء جلسة ألعاب جديدة",
    deviceCheckInDesc: "أدخل بيانات العميل، نوع الجهاز، وعدد الساعات المحجوزة.",
    checkOutDetails: "🧾 إنهاء الجلسة والفاتورة التفصيلية",
    checkOutDetailsDesc: "مراجعة ساعات اللعب، الطلبات والمشروبات، الغرامات الإضافية للتأخير، والإجمالي.",
    editRecord: "✏️ تعديل بيانات الجلسة",
    editRecordDesc: "يمكنك تعديل الساعات، المأكولات والمشروبات، أو الملاحظات",
    addVendor: "🎮 إضافة نوع / موديل جهاز",
    addVendorDesc: "إدارة موديلات البلايستيشن والغرف وأجهزة الكمبيوتر",
    deleteConfirmTitle: "تأكيد حذف الجلسة",
    deleteConfirmDesc: "هل أنت متأكد من حذف سجل هذه الجلسة؟",

    // Profits Page
    profitsTitle: "الأرباح وحسابات الكافيه نت",
    profitsSub: "متابعة أرباح الـ 24 ساعة، مبيعات الموظفين، والسجلات المؤرشفة",
    todayProfit: "أرباح دورة 24 ساعة الحالية",
    monthlyProfit: "إجمالي أرباح الشهر",
    allTimeProfit: "إجمالي الأرباح التاريخية",
    resetDailyProfit: "تصفير وأرشفة دورة 24 ساعة",
    profitHistory: "سجل دورات الـ 24 ساعة المؤرشفة",
    resetConfirmTitle: "تأكيد تصفير دورة 24 ساعة",
    resetConfirmDesc: "سيتم أرشفة أرباح الـ 24 ساعة الحالية وبدء دورة أرباح جديدة.",

    // Admin Page
    adminTitle: "إدارة الموظفين وتقييم الأداء",
    adminSub: "متابعة أداء الموظفين في الشفت ومبيعات كل موظف وصلاحيات النظام",
    addNewUser: "إضافة حساب موظف جديد",
    registeredUsers: "موظفو النظام والشفتات",
    userName: "اسم الموظف",
    emailAddress: "البريد الإلكتروني",
    role: "الصلاحية",
    createdAt: "تاريخ الانضمام",
    adminRole: "مسؤول النظام",
    userRole: "موظف / كاشير",
    editUser: "تعديل الموظف",
    makeAdmin: "منح صلاحية مسؤول",
    makeUser: "إلغاء صلاحية مسؤول",
    confirmDeleteUser: "تأكيد حذف حساب الموظف",

    // Profile Page
    profileTitle: "إعدادات الملف الشخصي",
    profileSub: "إدارة بياناتك الشخصية ولون أيقونة الملف الشخصي وكلمة المرور",
    accountSettings: "إعدادات الحساب وتفضيلات التطبيق",
    fullName: "الاسم الكامل",
    saveChanges: "حفظ التغييرات",
    appPreferences: "تفضيلات التطبيق",
    currency: "العملة",
    language: "اللغة",
    english: "English",
    arabic: "العربية (Arabic)",
    avatarColor: "لون الصورة الشخصية",
    avatarColorSub: "اختر لوناً تمييزياً لأيقونة حسابك في الشريط العلوي والجانبي",
    changePassword: "تغيير كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    passwordLeaveBlank: "اتركه فارغاً إذا كنت لا ترغب في تغيير كلمة المرور",
    administrator: "مدير النظام",
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
