/// <reference path="../../@types/index.d.ts" />

import fTypify = require('fib-typify')

import { setCompilerForVbox, wrapAsString } from '../vbox'
import { parseCommonOptions } from './_utils';

export const SUFFIX = ['.ts', '.tsx']

function _register (asPlainJavascript: boolean) {
    return function (vbox: Class_SandBox, options: FxHandbag.RegisterOptions): void {
        const {
            compilerOptions = fTypify.defaultCompilerOptions,
            burnout_timeout = 0,
            suffix = SUFFIX,
            emitter = null
        } = parseCommonOptions(options) || {}

        let compiler = null

        switch (asPlainJavascript) {
            case true:
                compiler = (buf: Class_Buffer) => wrapAsString(fTypify.compileRaw(buf + '', compilerOptions))
                break
            case false:
                compiler = (buf: Class_Buffer) => fTypify.compileRaw(buf + '', compilerOptions)
                break
            case undefined:
            default:
                break
        }
        setCompilerForVbox(vbox, {
            suffix,
            compiler,
            burnout_timeout,
            compile_to_iife_script: !asPlainJavascript,
            emitter
        })
    }

}

export const registerTypescriptAsPlainJavascript = _register(true)
export const registerTypescriptAsModule = _register(false)
