import { SaveIcon } from '@heroicons/react/solid'
import { useEffect, useRef, useState } from 'react'
import Badge from '../../Common/Badge'
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
  const [logLevel, setLogLevel] = useState<string>('')
  const [maxFiles, setMaxFiles] = useState<string>('')
  const [maxSize, setMaxSize] = useState<string>('')
  const [logLines, setLogLines] = useState<LogLine[]>([])
  const [logFiles, setLogFiles] = useState<LogFile[]>([])
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Logs'

    GetApiHandler<LogSetting>('/logs/settings').then((resp) => {
      setLogLevel(resp.level)
      setMaxFiles(resp.max_files.toString())
      setMaxSize(resp.max_size.toString())
    })

    GetApiHandler(`/logs/files`).then((resp) => {
      setLogFiles(resp)
    })

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

  useEffect(() => {
    const scrollToBottom = () => {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight
      }
    }
    scrollToBottom()
  }, [logLines])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (logLevel == null || maxSize == null || maxFiles == null) {
      return
    }

    await PostApiHandler('/logs/settings', {
      level: logLevel,
      max_size: maxSize,
      max_files: maxFiles,
    } satisfies LogSetting)
  }

  return (
    <div className="h-full w-full">
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
                  onChange={(e) => setMaxSize(parseInt(e.target.value))}
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
                  onChange={(e) => setMaxFiles(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="actions mt-5 w-full flex justify-end">
            <Button buttonType="primary" type="submit">
              <SaveIcon />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>

      <div className="section mt-12">
        <div className="section h-full w-full">
          <h3 className="heading">Logs</h3>
        </div>

        <div className="px-2 overflow-y-auto h-[60vh]" ref={logsRef}>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="sticky">
                <Table.TH className="sticky top-0 w-48">{'DATE'}</Table.TH>
                <Table.TH className="sticky top-0 w-14">{'LABEL'}</Table.TH>
                <Table.TH className="sticky top-0">{'EVENT'}</Table.TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-500 bg-zinc-700">
              {logLines.map((row, index: number) => {
                return (
                  <tr key={`log-list-${index}`}>
                    <Table.TD className="text-gray-300 w-48">
                      {new Date(row.date).toLocaleString()}
                    </Table.TD>
                    <Table.TD className="text-gray-300 w-14">
                      <Badge
                        badgeType={
                          row.level === 'error'
                            ? 'danger'
                            : row.level === 'warning'
                              ? 'warning'
                              : row.level === 'info'
                                ? 'success'
                                : 'default'
                        }
                      >
                        {row.level}
                      </Badge>
                    </Table.TD>
                    <Table.TD className="text-gray-300">{row.message}</Table.TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="section pl-2 pr-2 mt-8 ">
          <div className="section h-full w-full">
            <h3 className="heading">Log Files</h3>
            <p className="description">Download old log files</p>
          </div>
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <Table.TH>Log file</Table.TH>
                <Table.TH>Size</Table.TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-500 bg-zinc-700">
              {logFiles.map((row, index: number) => {
                return (
                  <tr key={`log-${index}`}>
                    <Table.TD className="text-gray-300">
                      <a href={`${API_BASE_PATH}/api/logs/files/${row.name}`}>
                        {row.name}
                      </a>
                    </Table.TD>
                    <Table.TD className="text-gray-300">{row.size}</Table.TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LogSettings
