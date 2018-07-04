import { get } from 'http';
import { createWriteStream, existsSync, rename, } from 'fs';

export type CdmServer = {
  readonly hostname: string
  readonly port: number
  readonly ssl: boolean
}

export enum CdmType {
  Published = 0,
  Unpublished = 1
}

export type CdmCollection = {
  readonly alias: string
  readonly name: string
  readonly path: string
  readonly secondary_alias: string
}

export type CdmFieldInfo = {
  readonly admin: number
  readonly dc: string
  readonly find: string
  readonly hide: number
  readonly name: string
  readonly nick: string
  readonly readonly: number
  readonly req: number
  readonly search: number
  readonly size: number
  readonly type: string
  readonly vocab: number
  readonly vocdb: string
}

export class ContentDm {
  public constructor(public server: CdmServer | null) {}

  public async collections(published?: CdmType): Promise<any> {
    return this._request('dmGetCollectionList', [String(published)])
      .then((data) => {
        return data as ReadonlyArray<CdmCollection>
      })
  }

  public async collectionFieldInfo(alias: string): Promise<any> {
    alias = alias.replace('/', '')
    return this._request('dmGetCollectionFieldInfo', [alias])
      .then((data) => {
        return data as ReadonlyArray<CdmFieldInfo>
      })
  }

  public async compoundObject(alias: string, pointer: string): Promise<any> {
    alias = alias.replace('/', '')
    return this._request('dmGetCompoundObjectInfo', [alias, pointer])
  }

  public async item(alias: string, pointer: string): Promise<any> {
    alias = alias.replace('/', '')
    return this._request('dmGetItemInfo', [alias, pointer])
  }

  public download(file: any, location: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this._fileUrl(file.alias, file.pointer);
      let destination = location + '/' + file.filename;
      let part = destination + '.part';

      if (existsSync(destination)) {
        resolve();
      }

      let output = createWriteStream(part);
      get(url, (response) => {
        response.pipe(output);
        output.on('finish', () => {
          output.close();
          rename(part, destination, (err) => {
            if (err) {
              console.error(err);
              reject(err);
            }
            resolve();
          });
        });
      });
    });
  }

  public _request(fnc: string, params?: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this._endpoint() === '') {
        const error = new Error('ContentDM settings are not set.')
        console.error(error.message)
        reject(error)
      }

      let strParams = params ? params.join('/') : ''
      let query = 'q=' + fnc + '/' + strParams + ('/json')
      get(this._endpoint() + query, (res) => {
        const { statusCode } = res

        if (statusCode !== 200) {
          const error = new Error('Request Failed.\n' +
          `Status Code: ${statusCode}`
          )
          console.error(error.message)
          reject(error)
        }

        let rawData = ''
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
          try {
            const data = JSON.parse(rawData)
            resolve(data)
          }
          catch(e) {
            reject(e)
          }
        })
      })
    })
  }

  private _fileUrl(alias: string, pointer: string): string {
    if (!this.server) {
      return ''
    }

    return 'http' + (this.server.ssl ? 's' : '') + '://' +
    this.server.hostname + ':' + this.server.port +
      '/cgi-bin/showfile.exe?CISOROOT=' + alias + '&CISOPTR=' + pointer;
  }

  private _endpoint(): string {
    if (!this.server) {
      return ''
    }

    return 'http' + (this.server.ssl ? 's' : '') + '://' +
      this.server.hostname + ':' + this.server.port +
      '/dmwebservices/index.php?'
  }

}