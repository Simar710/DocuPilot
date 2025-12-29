'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BotMessageSquare,
  FileText,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquare,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '../logo';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/docs', icon: FileText, label: 'Documents' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
];

function getInitials(name?: string | null) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}

function NavContent() {
  const pathname = usePathname();
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            pathname.startsWith(item.href) ? 'bg-accent text-primary' : 'text-muted-foreground'
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function UserMenu() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'}/>
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AppSidebar() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="md:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard">
                        <Logo />
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <NavContent />
                </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-auto">
             <UserMenu />
        </div>
      </header>
      <div className="hidden border-r bg-muted/40 md:fixed md:inset-y-0 md:flex md:w-[280px] md:flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">DocuPilot</span>
          </Link>
        </div>
        <div className="flex-1">
          <NavContent />
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
                <AvatarImage src={useAuth().user?.photoURL || undefined}/>
                <AvatarFallback>{getInitials(useAuth().user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className='flex-1 overflow-hidden'>
                <p className='font-semibold truncate'>{useAuth().user?.displayName || 'User'}</p>
                <p className='text-xs text-muted-foreground truncate'>{useAuth().user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut(auth).then(() => window.location.href = '/login')}>
                <LogOut className="h-5 w-5 text-muted-foreground"/>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
