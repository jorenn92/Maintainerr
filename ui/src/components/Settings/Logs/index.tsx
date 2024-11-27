import { SaveIcon } from '@heroicons/react/solid'
import { useEffect, useMemo, useRef, useState } from 'react'
import Table from '../../Common/Table'
import Button from '../../Common/Button'
import GetApiHandler, {
  API_BASE_PATH,
  PostApiHandler,
} from '../../../utils/ApiHandler'

type LogLine = {
  date: number
  message: string
  level: string
}

type LogFile = {
  name: string
  size: number
}

type LogSetting = {
  level: string
  max_size: number
  max_files: number
}

const LogSettings = () => {
  useEffect(() => {
    document.title = 'Maintainerr - Settings - Logs'
  }, [])

  return (
    <div className="h-full w-full">
      <LogSettingsForm />
      <Logs />
      <LogFiles />
    </div>
  )
}

const LogSettingsForm = () => {
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [logLevel, setLogLevel] = useState<string>('')
  const [maxFiles, setMaxFiles] = useState<string>('')
  const [maxSize, setMaxSize] = useState<string>('')

  useEffect(() => {
    GetApiHandler<LogSetting>('/logs/settings').then((resp) => {
      setLogLevel(resp.level)
      setMaxFiles(resp.max_files.toString())
      setMaxSize(resp.max_size.toString())
      setSettingsLoaded(true)
    })
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (logLevel == null || maxSize == null || maxFiles == null) {
      return
    }

    await PostApiHandler('/logs/settings', {
      level: logLevel,
      max_size: parseInt(maxSize),
      max_files: parseInt(maxFiles),
    } satisfies LogSetting)
  }

  return (
    <div className="section">
      <div className="section h-full w-full">
        <h3 className="heading">Log Settings</h3>
        <p className="description">Log configuration</p>
      </div>

      <div className="section">
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="logLevel" className="text-label">
              Level
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <select
                  id="logLevel"
                  name="logLevel"
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="rounded-l-only"
                >
                  {!settingsLoaded && <option value="" disabled></option>}
                  <option value="silly">Silly</option>
                  <option value="debug">Debug</option>
                  <option value="verbose">Verbose</option>
                  <option value="log">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="maxSize" className="text-label">
              Max Size (MB)
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="maxSize"
                  id="maxSize"
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="maxFiles" className="text-label">
              Max Backups
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="maxFiles"
                  id="maxFiles"
                  type="number"
                  value={maxFiles}
                  onChange={(e) => setMaxFiles(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="actions mt-5 flex w-full justify-end">
            <Button
              buttonType="primary"
              type="submit"
              disabled={!settingsLoaded}
            >
              <SaveIcon />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Logs = () => {
  const [logLines, setLogLines] = useState<LogLine[]>([])
  const [logFilter, setLogFilter] = useState<string>('')
  const [scrollToBottom, setScrollToBottom] = useState<boolean>(true)
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const es = new EventSource('/api/logs/stream')
    es.addEventListener('log', (event) => {
      const message: LogLine = JSON.parse(event.data)
      setLogLines((prev) => [...prev, message])
    })

    es.onerror = (e) => {
      console.error('EventSource failed:', e)
    }

    return () => {
      es.close()
    }
  }, [])

  const filteredLogLines = useMemo(() => {
    const filter = logFilter.toLowerCase()
    return logLines.filter(
      (log) =>
        log.message.toLowerCase().includes(filter) ||
        log.level.toLowerCase() == filter,
    )
  }, [logLines, logFilter])

  useEffect(() => {
    if (!scrollToBottom || !logsRef.current) return

    logsRef.current.scrollTop = logsRef.current.scrollHeight
  }, [filteredLogLines.length])

  return (
    <div className="section">
      <div className="section h-full w-full">
        <h3 className="heading">Logs</h3>
      </div>

      <div className="section">
        <div className="mb-4 flex flex-col-reverse justify-between gap-4 sm:flex-row">
          <div className="form-input grow !p-0">
            <div className="form-input-field">
              <input
                name="logFilter"
                placeholder="Log filter"
                type="text"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <label htmlFor="active">Scroll to bottom on new message</label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  type="checkbox"
                  name="scrollToBottom"
                  className="border-zinc-600 hover:border-zinc-500 focus:border-zinc-500 focus:bg-opacity-100 focus:placeholder-zinc-400 focus:outline-none focus:ring-0"
                  checked={scrollToBottom}
                  onChange={() => {
                    setScrollToBottom(!scrollToBottom)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="h-[60vh] overflow-auto rounded bg-zinc-700 p-2"
          ref={logsRef}
        >
          {filteredLogLines.map((row, index: number) => {
            const levelColor =
              row.level === 'ERROR'
                ? 'text-red-400'
                : row.level === 'WARN'
                  ? 'text-yellow-400'
                  : row.level === 'INFO'
                    ? 'text-green-400'
                    : 'text-indigo-400'

            return (
              <div key={`log-list-${index}`} className="font-mono">
                <span className="text-gray-400">
                  {new Date(row.date).toLocaleTimeString()}
                </span>
                <span className={`font-semibold ${levelColor} px-2`}>
                  {row.level}
                </span>
                <span className="text-white">{row.message}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const LogFiles = () => {
  const [logFiles, setLogFiles] = useState<LogFile[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    GetApiHandler<LogFile[]>(`/logs/files`).then((resp) => {
      // Sort the resp by name descending:
      resp.sort((a, b) => {
        if (a.name < b.name) {
          return 1
        }
        if (a.name > b.name) {
          return -1
        }
        return 0
      })

      setLogFiles(resp)
      setLoading(false)
    })
  }, [])

  const filesPerPage = 10
  const lastPage = Math.ceil(logFiles.length / filesPerPage)

  const pagedLogFiles = useMemo(() => {
    const start = (page - 1) * filesPerPage
    const end = start + filesPerPage
    return logFiles.slice(start, end)
  }, [logFiles, page])

  return (
    <div className="section">
      <div className="section h-full w-full">
        <h3 className="heading">Log Files</h3>
        <p className="description">Download log files</p>
      </div>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <Table.TH>Log file</Table.TH>
            <Table.TH>Size</Table.TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-500 bg-zinc-700">
          {pagedLogFiles.map((row, index: number) => {
            return (
              <tr key={`log-${index}`}>
                <Table.TD>
                  <a href={`${API_BASE_PATH}/api/logs/files/${row.name}`}>
                    {row.name}
                  </a>
                </Table.TD>
                <Table.TD>{Math.ceil(row.size / 1024)} KB</Table.TD>
              </tr>
            )
          })}
          {!loading && logFiles.length === 0 && (
            <tr>
              <Table.TD colSpan={2} alignText="center">
                No log files found
              </Table.TD>
            </tr>
          )}
        </tbody>
      </table>
      <div className="actions mt-5 flex w-full justify-end gap-3">
        <Button
          buttonType={page === 1 ? 'default' : 'primary'}
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Button
          buttonType={page === lastPage ? 'default' : 'primary'}
          disabled={page === lastPage}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default LogSettings
