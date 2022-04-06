import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import Transition from '../../Transition'

interface NavBarLink {
  key: string
  href: string
  //   svgIcon: ReactNode
  name: string
}

const navBarItems: NavBarLink[] = [
  {
    key: '0',
    href: '/overview',
    name: 'Overview',
  },
  {
    key: '1',
    href: '/rules',
    name: 'Rules',
  },
  {
    key: '2',
    href: '/collections',
    name: 'Collections',
  },
  {
    key: '3',
    href: '/settings',
    name: 'Settings',
  },
]

interface NavBarProps {
  open?: boolean
  setClosed: () => void
}

const NavBar: React.FC<NavBarProps> = ({ open, setClosed }) => {
  const navRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  return (
    <div>
      <div className="lg:hidden">
        <Transition show={open}>
          <div className="fixed inset-0 z-40 flex">
            <Transition
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-zinc-900 opacity-90"></div>
              </div>
            </Transition>
            <Transition
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <>
                <div className="sidebar relative flex w-full max-w-xs flex-1 flex-col bg-zinc-800">
                  <div className="sidebar-close-button absolute top-0 right-0 -mr-14 p-1">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-zinc-600 focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <p>X</p>
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex h-0 flex-1 flex-col overflow-y-auto pt-8 pb-8 sm:pb-4"
                  >
                    <div className="flex flex-shrink-0 items-center px-2">
                      <span className="px-4 text-xl text-zinc-50">
                        <a href="/">
                          <h2 className="">Maintainerr</h2>
                          {/* <Image src="/logo_full.svg" alt="Logo" /> */}
                        </a>
                      </span>
                    </div>
                    <nav className="mt-16 flex-1 space-y-4 px-4">
                      {navBarItems.map((link) => {
                        return (
                          <Link key={link.key} href={link.href}>
                            <a
                              onClick={() => setClosed()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setClosed()
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className={`flex items-center rounded-md px-2 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out focus:outline-none`}
                            >
                              {link.name}
                            </a>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                </div>
                <div className="w-14 flex-shrink-0">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition>
          </div>
        </Transition>
      </div>

      <div className="fixed top-0 bottom-0 left-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div className="sidebar flex w-64 flex-col">
          <div className="flex h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-4">
              <div className="flex flex-shrink-0 items-center">
                <span className="px-4 text-2xl text-zinc-50">
                  <a href="/">
                    <h2>Maintainerr</h2>
                    {/* <img src="/logo_full.svg" alt="Logo" /> */}
                  </a>
                </span>
              </div>
              <nav className="mt-16 flex-1 space-y-4 px-4">
                {navBarItems.map((navBarLink) => {
                  return (
                    <Link
                      key={`desktop-${navBarLink.key}`}
                      href={navBarLink.href}
                    >
                      <a
                        className={`group flex items-center rounded-md px-2 py-2 text-lg font-medium leading-6 text-white transition duration-150 ease-in-out focus:outline-none`}
                      >
                        {navBarLink.name}
                      </a>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBar
