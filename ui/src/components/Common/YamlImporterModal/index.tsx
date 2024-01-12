import { useRef } from 'react'
import Modal from '../Modal'
import Editor from '@monaco-editor/react'

export interface IYamlImporterModal {
  onImport: (yaml: string) => void
  onCancel: () => void
  yaml?: string
}

const YamlImporterModal = (props: IYamlImporterModal) => {
  const editorRef = useRef(undefined)

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor
  }

  const download = async () => {
    if (props.yaml) {
      const blob = new Blob([props.yaml], {
        type: 'text/yaml',
      })
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = `maintainerr_rules_${new Date().getTime()}.yaml`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div>
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={() => props.onCancel()}
        okDisabled={false}
        onOk={
          props.yaml
            ? () => download()
            : () => props.onImport((editorRef.current as any).getValue())
        }
        okText={props.yaml ? 'Download' : 'Import'}
        okButtonType={'primary'}
        title={'Rule Yaml editor'}
        iconSvg={''}
      >
        <Editor
          height="70vh"
          defaultLanguage="yaml"
          theme="vs-dark"
          {...(props.yaml ? { defaultValue: props.yaml } : undefined)}
          onMount={handleEditorDidMount}
        />
      </Modal>
    </div>
  )
}
export default YamlImporterModal
