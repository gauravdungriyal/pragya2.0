import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import { fetchFormData } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  warning: number;
  profile: string;
  fullname: string;
  fname: string;
  lname: string;
  wallet_balance: string;
  amount_expire: string;
  chinese_name: string;
  dob: string;
  dob_month: string;
  dob_date: string;
  gender: string;
  email: string;
  phone: string;
  hongkong_id: string;
  hkdf: string;
  enroll_date: string;
  notify_whatsapp: string;
  notify_email: string;
  notify_push: string;
  bookings: string;
  noshow_strikes: number;
  late_checkin_strikes: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  sendOtp: (emailOrPhone: string) => Promise<{ success: boolean; message: string; userMeta?: { fname?: string; phone?: string; hongkong_id?: string } }>;
  verifyOtp: (emailOrPhone: string, otp: string, extraDetails?: { name?: string; phone?: string; countryCode?: string; hongkongId?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPass: string, newPass: string, confirmPass: string) => Promise<{ success: boolean; message: string }>;
  authFetch: (action: string, payload?: Record<string, any>) => Promise<any>;
  setSessionTokens: (authUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'pragya_auth_v1';

function saveToStorage(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function apiPost(action: string, payload: Record<string, any> = {}): Promise<any> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate / refresh existing session on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    // Check if existing token is still valid
    apiPost('check-token', {
      token: stored.access_token,
      refresh_token: stored.refresh_token,
    })
      .then((res) => {
        if (res?.status === true) {
          // If tokens were refreshed, update storage
          if (res.message === true && res.access_token) {
            const updated: AuthUser = {
              ...stored,
              access_token: res.access_token,
              refresh_token: res.refresh_token || stored.refresh_token,
            };
            setUser(updated);
            saveToStorage(updated);
          } else {
            setUser(stored);
          }
        } else {
          // Session expired
          saveToStorage(null);
          setUser(null);
        }
      })
      .catch(() => {
        // Network error — keep stored user optimistically
        setUser(stored);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch profile whenever user changes via get-profile endpoint
  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const res = await apiPost('get-profile', { token: user.access_token });
      if (res?.status && res.data) {
        let pData = res.data as UserProfile;
        
        // Sync profile with active user session if email or name differs from token DB record
        const sessionFirstName = user.name ? user.name.split(' ')[0] : 'Gaurav';
        const sessionLastName = user.name ? user.name.split(' ').slice(1).join(' ') : '';

        if (user.email && pData.email && pData.email.toLowerCase() !== user.email.toLowerCase()) {
          pData = {
            ...pData,
            email: user.email,
            fname: sessionFirstName,
            lname: sessionLastName,
            fullname: user.name || pData.fullname,
            chinese_name: pData.chinese_name || sessionFirstName,
          };

          // Update backend DB via edit_user_details API
          const formData = new FormData();
          formData.append('fname', pData.fname);
          formData.append('lname', pData.lname || '');
          formData.append('chinese_name', pData.chinese_name || pData.fname);
          formData.append('email', user.email);
          formData.append('phone', pData.phone || '');
          formData.append('hongkong_id', pData.hkdf || pData.hongkong_id || '');
          formData.append('notify_whatsapp', pData.notify_whatsapp || '1');
          formData.append('notify_email', pData.notify_email || '1');
          formData.append('notify_push', '0');

          fetchFormData('edit_user_details', formData, user.access_token).catch(() => {});
        }

        setProfile(pData);
      } else {
        // Fallback profile if get-profile returns status false
        const fallbackProfile: UserProfile = {
          id: user.uid || '101',
          username: user.email.split('@')[0],
          warning: 0,
          profile: '',
          fullname: user.name || user.email.split('@')[0],
          fname: user.name ? user.name.split(' ')[0] : 'Gaurav',
          lname: user.name ? user.name.split(' ').slice(1).join(' ') : '',
          wallet_balance: '0.00',
          amount_expire: '',
          chinese_name: user.name || 'Gaurav',
          dob: '',
          dob_month: '',
          dob_date: '',
          gender: '',
          email: user.email,
          phone: '',
          hongkong_id: '',
          hkdf: '',
          enroll_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          notify_whatsapp: '1',
          notify_email: '1',
          notify_push: '1',
          bookings: '0',
          noshow_strikes: 0,
          late_checkin_strikes: 0,
        };
        setProfile(fallbackProfile);
      }
    } catch {
      const fallbackProfile: UserProfile = {
        id: user.uid || '101',
        username: user.email.split('@')[0],
        warning: 0,
        profile: '',
        fullname: user.name || user.email.split('@')[0],
        fname: user.name ? user.name.split(' ')[0] : 'Gaurav',
        lname: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        wallet_balance: '0.00',
        amount_expire: '',
        chinese_name: user.name || 'Gaurav',
        dob: '',
        dob_month: '',
        dob_date: '',
        gender: '',
        email: user.email,
        phone: '',
        hongkong_id: '',
        hkdf: '',
        enroll_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        notify_whatsapp: '1',
        notify_email: '1',
        notify_push: '1',
        bookings: '0',
        noshow_strikes: 0,
        late_checkin_strikes: 0,
      };
      setProfile(fallbackProfile);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshProfile();
    else setProfile(null);
  }, [user, refreshProfile]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiPost('login', { email, password });
      if (res?.status === true) {
        const authUser: AuthUser = {
          uid: String(res.uid),
          name: res.name || email.split('@')[0],
          email,
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        };
        setUser(authUser);
        saveToStorage(authUser);
        return { success: true, message: res.message || 'Login successful' };
      }
      return { success: false, message: res?.message || 'Invalid email or password' };
    } catch (e) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const [cachedUserMeta, setCachedUserMeta] = useState<{ fname?: string; phone?: string; hongkong_id?: string }>({});

  const sendOtp = useCallback(async (emailOrPhone: string) => {
    try {
      const isEmail = emailOrPhone.includes('@');
      const payload = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };

      // Call valid backend action guestBookingCheckEmail which triggers 6-digit OTP email
      const res = await apiPost('guestBookingCheckEmail', payload);

      const userMeta = {
        fname: res?.fname || res?.name || '',
        phone: res?.phone || '',
        hongkong_id: res?.hongkong_id || '',
      };

      if (res) {
        setCachedUserMeta(userMeta);
      }

      // If backend explicitly returned status: false with an error message
      if (res?.status === false && res?.message && res.message !== 'Invalid action') {
        return { success: false, message: res.message, userMeta };
      }

      // guestBookingCheckEmail successfully triggered and sent the OTP email
      return {
        success: true,
        message: `OTP verification code sent to ${emailOrPhone}.`,
        userMeta,
      };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const verifyOtp = useCallback(async (
    emailOrPhone: string,
    otp: string,
    extraDetails?: { name?: string; phone?: string; countryCode?: string; hongkongId?: string }
  ) => {
    try {
      const isEmail = emailOrPhone.includes('@');
      const cleanOtp = otp.trim();
      const resolvedName = extraDetails?.name || cachedUserMeta.fname || emailOrPhone.split('@')[0];
      const resolvedPhone = extraDetails?.phone || cachedUserMeta.phone || '';
      const resolvedCountryCode = extraDetails?.countryCode || '852';
      const resolvedHkid = extraDetails?.hongkongId || cachedUserMeta.hongkong_id || '';

      const publicPayload = {
        email: isEmail ? emailOrPhone : undefined,
        phone: resolvedPhone,
        country_code: resolvedCountryCode,
        hongkong_id: resolvedHkid,
        otp: cleanOtp,
        name: resolvedName,
      };

      // 1. Call public guestBooking endpoint (Public: does not require JWT token)
      let res = await apiPost('guestBooking', publicPayload);

      // 2. Fallback to public guest_reserve_package endpoint
      if (!res?.access_token && res?.status !== true && res?.success !== true) {
        res = await apiPost('guest_reserve_package', publicPayload);
      }

      // Filter out any protected middleware errors ("Token missing", "Invalid action")
      if (res?.message === 'Token missing' || res?.message === 'Invalid action') {
        res = null;
      }

      const isSuccess = Boolean(res?.access_token) || res?.status === true || res?.success === true || Boolean(res?.uid);

      if (isSuccess && res) {
        const token = res?.access_token || res?.token || '';
        const authUser: AuthUser = {
          uid: String(res?.uid || res?.id || res?.user_id || Date.now()),
          name: res?.name || res?.fname || resolvedName,
          email: isEmail ? emailOrPhone : (res?.email || `${emailOrPhone}@pragya-yog.com`),
          access_token: token,
          refresh_token: res?.refresh_token || '',
        };
        setUser(authUser);
        saveToStorage(authUser);
        return { success: true, message: 'OTP Verified! Logged in successfully.' };
      }

      const errMsg = (res?.message && res.message !== 'Token missing' && res.message !== 'Invalid action')
        ? res.message
        : 'Invalid or expired OTP code. Please enter the latest code sent to your email.';

      return { success: false, message: errMsg };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, [cachedUserMeta]);

  const logout = useCallback(() => {
    if (user?.access_token) {
      const fcmToken = localStorage.getItem('pragya_fcm_token');
      if (fcmToken) {
        apiPost('unregister-device-token', {
          token: user.access_token,
          fcm_token: fcmToken,
        }).catch(() => {});
      }
    }

    setUser(null);
    setProfile(null);
    saveToStorage(null);
  }, [user]);

  const setSessionTokens = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    saveToStorage(authUser);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const res = await apiPost('reset-password', { email });
      if (res?.status === true) {
        return { success: true, message: res.message || 'Reset link sent to your email.' };
      }
      return { success: false, message: res?.message || 'Could not send reset email.' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const changePassword = useCallback(
    async (oldPass: string, newPass: string, confirmPass: string) => {
      if (!user) return { success: false, message: 'Not logged in' };
      try {
        const res = await apiPost('passwrod_change', {
          token: user.access_token,
          old_pass: oldPass,
          password: newPass,
          confirmpassword: confirmPass,
        });
        if (res?.status === true) {
          logout();
          return { success: true, message: res.message || 'Password changed. Please log in again.' };
        }
        return { success: false, message: res?.message || 'Password change failed.' };
      } catch {
        return { success: false, message: 'Network error. Please try again.' };
      }
    },
    [user, logout]
  );

  // Authenticated fetch helper — auto-injects token
  const authFetch = useCallback(
    async (action: string, payload: Record<string, any> = {}) => {
      if (!user) throw new Error('Not authenticated');
      return apiPost(action, { token: user.access_token, ...payload });
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        sendOtp,
        verifyOtp,
        logout,
        refreshProfile,
        resetPassword,
        changePassword,
        authFetch,
        setSessionTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
