export function getSessionToken(): string {
    if (typeof window !== 'undefined') {
        const userStr = sessionStorage.getItem('user');
        console.log(userStr)
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                return userObj.token || '';
            } catch {
                return '';
            }
        }
    }
    return '';
}

export type UserType = {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        profilePicture: string;
    };
};


export function getUser(): UserType | null {
    const userData = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
    if (userData) {
        const user = JSON.parse(userData);
        if (user && user.token && user.user) {
            return user as UserType;
        }
    }

    return null;
}


export async function getAuthUser(): Promise<UserType> {
    const user = getUser();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${user?.token}`
      }
    });
  
    if (!response.ok) {
        return { token: '', user: { id: '', name: '', email: '', role: '', status: '', createdAt: '', updatedAt: '', profilePicture: '' } };
    }
    const data: UserType = await response.json();
    return data;
  }

