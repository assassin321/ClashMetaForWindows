import { useParams } from 'react-router-dom'
import { SimpleModuleEditor } from '@renderer/components/simple/simple-module-editor'
import type { SimpleModule } from '../../../shared/simple-config'
import { SIMPLE_MODULES } from '../../../shared/simple-config'

const SimpleModulePage: React.FC = () => {
  const { module = 'general' } = useParams()
  const key = module as SimpleModule
  return <SimpleModuleEditor module={SIMPLE_MODULES[key] ? key : 'general'} />
}
export default SimpleModulePage
